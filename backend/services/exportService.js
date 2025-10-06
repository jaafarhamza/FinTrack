const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Transaction, Category, Budget, SavingGoal } = require('../models');
const { Op } = require('sequelize');

class ExportService {
  constructor() {
    this.exportDir = path.join(__dirname, '..', 'public', 'exports');
    this.ensureExportDirectory();
  }

  ensureExportDirectory() {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  generateFilename(type, format, userId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${type}_${userId}_${timestamp}.${format}`;
  }

  // Export transactions to CSV
  async exportTransactionsToCSV(userId, filters = {}) {
    try {
      const whereClause = { userId };
      
      if (filters.startDate && filters.endDate) {
        whereClause.date = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }
      
      if (filters.type && filters.type !== 'all') {
        whereClause.type = filters.type;
      }
      
      if (filters.categoryId && filters.categoryId !== 'all') {
        whereClause.categoryId = filters.categoryId;
      }

      const transactions = await Transaction.findAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          }
        ],
        order: [['date', 'DESC']]
      });

      const filename = this.generateFilename('transactions', 'csv', userId);
      const filepath = path.join(this.exportDir, filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'date', title: 'Date' },
          { id: 'type', title: 'Type' },
          { id: 'amount', title: 'Amount' },
          { id: 'description', title: 'Description' },
          { id: 'category', title: 'Category' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      const csvData = transactions.map(transaction => ({
        date: transaction.date,
        type: transaction.type,
        amount: parseFloat(transaction.amount).toFixed(2),
        description: transaction.description || '',
        category: transaction.category ? transaction.category.name : 'Uncategorized',
        createdAt: transaction.createdAt.toISOString().split('T')[0]
      }));

      await csvWriter.writeRecords(csvData);
      
      return {
        success: true,
        filename,
        filepath,
        recordCount: transactions.length
      };
    } catch (error) {
      console.error('CSV export error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export transactions to PDF
  async exportTransactionsToPDF(userId, filters = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const whereClause = { userId };
        
        if (filters.startDate && filters.endDate) {
          whereClause.date = {
            [Op.between]: [filters.startDate, filters.endDate]
          };
        }
        
        if (filters.type && filters.type !== 'all') {
          whereClause.type = filters.type;
        }
        
        if (filters.categoryId && filters.categoryId !== 'all') {
          whereClause.categoryId = filters.categoryId;
        }

        const transactions = await Transaction.findAll({
          where: whereClause,
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['name']
            }
          ],
          order: [['date', 'DESC']]
        });

        const filename = this.generateFilename('transactions', 'pdf', userId);
        const filepath = path.join(this.exportDir, filename);

        console.log(`Generating transactions PDF: ${filename}`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Transaction Report', { align: 'center' });
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();

        // Summary
        const totalIncome = transactions
          .filter(t => t.type === 'Income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const totalExpenses = transactions
          .filter(t => t.type === 'Expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        doc.fontSize(14).text('Summary:', { underline: true });
        doc.fontSize(12).text(`Total Income: $${totalIncome.toFixed(2)}`);
        doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`);
        doc.text(`Net Amount: $${(totalIncome - totalExpenses).toFixed(2)}`);
        doc.moveDown();

        // Transactions table
        doc.fontSize(14).text('Transactions:', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        const itemHeight = 20;
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;
        const margin = 50;
        const tableWidth = pageWidth - (margin * 2);

        // Headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', margin, tableTop);
        doc.text('Type', margin + 80, tableTop);
        doc.text('Amount', margin + 150, tableTop);
        doc.text('Category', margin + 220, tableTop);
        doc.text('Description', margin + 320, tableTop);

        // Draw header line
        doc.moveTo(margin, tableTop + 15)
           .lineTo(pageWidth - margin, tableTop + 15)
           .stroke();

        // Transaction rows
        doc.fontSize(9).font('Helvetica');
        let currentY = tableTop + 25;

        transactions.forEach((transaction, index) => {
          // if need a new page
          if (currentY > pageHeight - 100) {
            doc.addPage();
            currentY = 50;
          }

          const date = new Date(transaction.date).toLocaleDateString();
          const type = transaction.type;
          const amount = `$${parseFloat(transaction.amount).toFixed(2)}`;
          const category = transaction.category ? transaction.category.name : 'Uncategorized';
          const description = (transaction.description || '').substring(0, 30);

          doc.text(date, margin, currentY);
          doc.text(type, margin + 80, currentY);
          doc.text(amount, margin + 150, currentY);
          doc.text(category, margin + 220, currentY);
          doc.text(description, margin + 320, currentY);

          currentY += itemHeight;
        });

        stream.on('finish', () => {
          console.log(`Transactions PDF generated successfully: ${filename}`);
          resolve({
            success: true,
            filename,
            filepath,
            recordCount: transactions.length
          });
        });

        stream.on('error', (error) => {
          reject({
            success: false,
            error: error.message
          });
        });

        doc.on('error', (error) => {
          reject({
            success: false,
            error: error.message
          });
        });

        doc.end();

      } catch (error) {
        console.error('PDF export error:', error);
        reject({
          success: false,
          error: error.message
        });
      }
    });
  }

  // Export budgets to CSV
  async exportBudgetsToCSV(userId, year, month) {
    try {
      const budgets = await Budget.findAll({
        where: { userId, year, month },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          }
        ],
        order: [['maxAmount', 'DESC']]
      });

      const filename = this.generateFilename('budgets', 'csv', userId);
      const filepath = path.join(this.exportDir, filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'name', title: 'Budget Name' },
          { id: 'category', title: 'Category' },
          { id: 'maxAmount', title: 'Budget Amount' },
          { id: 'spentAmount', title: 'Spent Amount' },
          { id: 'remainingAmount', title: 'Remaining Amount' },
          { id: 'percentage', title: 'Spent Percentage' },
          { id: 'status', title: 'Status' }
        ]
      });

      const csvData = budgets.map(budget => {
        const remaining = parseFloat(budget.maxAmount) - parseFloat(budget.spentAmount);
        const percentage = ((parseFloat(budget.spentAmount) / parseFloat(budget.maxAmount)) * 100).toFixed(1);
        const status = parseFloat(budget.spentAmount) > parseFloat(budget.maxAmount) ? 'Exceeded' : 
                      percentage >= 90 ? 'Warning' : 'Good';

        return {
          name: budget.name,
          category: budget.category ? budget.category.name : 'General',
          maxAmount: parseFloat(budget.maxAmount).toFixed(2),
          spentAmount: parseFloat(budget.spentAmount).toFixed(2),
          remainingAmount: remaining.toFixed(2),
          percentage: `${percentage}%`,
          status: status
        };
      });

      await csvWriter.writeRecords(csvData);
      
      return {
        success: true,
        filename,
        filepath,
        recordCount: budgets.length
      };
    } catch (error) {
      console.error('Budget CSV export error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export saving goals to CSV
  async exportSavingGoalsToCSV(userId) {
    try {
      const savingGoals = await SavingGoal.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      const filename = this.generateFilename('saving_goals', 'csv', userId);
      const filepath = path.join(this.exportDir, filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'name', title: 'Goal Name' },
          { id: 'targetAmount', title: 'Target Amount' },
          { id: 'currentAmount', title: 'Current Amount' },
          { id: 'remainingAmount', title: 'Remaining Amount' },
          { id: 'progress', title: 'Progress %' },
          { id: 'deadline', title: 'Deadline' },
          { id: 'status', title: 'Status' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      const csvData = savingGoals.map(goal => {
        const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
        const progress = ((parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100).toFixed(1);

        return {
          name: goal.name,
          targetAmount: parseFloat(goal.targetAmount).toFixed(2),
          currentAmount: parseFloat(goal.currentAmount).toFixed(2),
          remainingAmount: remaining.toFixed(2),
          progress: `${progress}%`,
          deadline: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline',
          status: goal.status,
          createdAt: goal.createdAt.toISOString().split('T')[0]
        };
      });

      await csvWriter.writeRecords(csvData);
      
      return {
        success: true,
        filename,
        filepath,
        recordCount: savingGoals.length
      };
    } catch (error) {
      console.error('Saving goals CSV export error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export fin report to PDF
  async exportFinancialReportToPDF(userId, year, month) {
    return new Promise(async (resolve, reject) => {
      try {
        const filename = this.generateFilename('financial_report', 'pdf', userId);
        const filepath = path.join(this.exportDir, filename);

        console.log(`Generating financial report PDF: ${filename}`);
        // Get data
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const [transactions, budgets, savingGoals] = await Promise.all([
          Transaction.findAll({
            where: {
              userId,
              date: {
                [Op.between]: [startDate, endDate]
              }
            },
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['name']
              }
            ],
            order: [['date', 'DESC']]
          }),
          Budget.findAll({
            where: { userId, year, month },
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['name']
              }
            ]
          }),
          SavingGoal.findAll({
            where: { userId }
          })
        ]);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24).text('Financial Report', { align: 'center' });
        doc.fontSize(14).text(`${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, { align: 'center' });
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary section
        const totalIncome = transactions
          .filter(t => t.type === 'Income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const totalExpenses = transactions
          .filter(t => t.type === 'Expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalBudgetAmount = budgets.reduce((sum, b) => sum + parseFloat(b.maxAmount), 0);
        const totalSpentAmount = budgets.reduce((sum, b) => sum + parseFloat(b.spentAmount), 0);

        const totalSavingGoals = savingGoals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0);
        const currentSavingProgress = savingGoals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0);

        doc.fontSize(16).text('Financial Summary', { underline: true });
        doc.moveDown();
        
        doc.fontSize(12);
        doc.text(`Total Income: $${totalIncome.toFixed(2)}`);
        doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`);
        doc.text(`Net Income: $${(totalIncome - totalExpenses).toFixed(2)}`);
        doc.moveDown();
        
        doc.text(`Total Budget Amount: $${totalBudgetAmount.toFixed(2)}`);
        doc.text(`Total Spent: $${totalSpentAmount.toFixed(2)}`);
        doc.text(`Budget Remaining: $${(totalBudgetAmount - totalSpentAmount).toFixed(2)}`);
        doc.moveDown();
        
        doc.text(`Total Saving Goals: $${totalSavingGoals.toFixed(2)}`);
        doc.text(`Current Progress: $${currentSavingProgress.toFixed(2)}`);
        doc.text(`Remaining to Save: $${(totalSavingGoals - currentSavingProgress).toFixed(2)}`);
        doc.moveDown(2);

        // Budget section
        if (budgets.length > 0) {
          doc.fontSize(16).text('Budget Overview', { underline: true });
          doc.moveDown();

          budgets.forEach(budget => {
            const remaining = parseFloat(budget.maxAmount) - parseFloat(budget.spentAmount);
            const percentage = ((parseFloat(budget.spentAmount) / parseFloat(budget.maxAmount)) * 100).toFixed(1);
            const status = parseFloat(budget.spentAmount) > parseFloat(budget.maxAmount) ? 'EXCEEDED' : 
                          percentage >= 90 ? 'WARNING' : 'GOOD';

            doc.fontSize(12).text(`${budget.name} (${budget.category ? budget.category.name : 'General'})`, { underline: true });
            doc.fontSize(10);
            doc.text(`Budget: $${parseFloat(budget.maxAmount).toFixed(2)}`);
            doc.text(`Spent: $${parseFloat(budget.spentAmount).toFixed(2)}`);
            doc.text(`Remaining: $${remaining.toFixed(2)}`);
            doc.text(`Progress: ${percentage}% - Status: ${status}`);
            doc.moveDown();
          });
          doc.moveDown();
        }

        // Saving Goals section
        if (savingGoals.length > 0) {
          doc.fontSize(16).text('Saving Goals', { underline: true });
          doc.moveDown();

          savingGoals.forEach(goal => {
            const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
            const progress = ((parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100).toFixed(1);

            doc.fontSize(12).text(goal.name, { underline: true });
            doc.fontSize(10);
            doc.text(`Target: $${parseFloat(goal.targetAmount).toFixed(2)}`);
            doc.text(`Current: $${parseFloat(goal.currentAmount).toFixed(2)}`);
            doc.text(`Remaining: $${remaining.toFixed(2)}`);
            doc.text(`Progress: ${progress}% - Status: ${goal.status}`);
            if (goal.deadline) {
              doc.text(`Deadline: ${new Date(goal.deadline).toLocaleDateString()}`);
            }
            doc.moveDown();
          });
        }

        stream.on('finish', () => {
          console.log(`Financial report PDF generated successfully: ${filename}`);
          resolve({
            success: true,
            filename,
            filepath,
            recordCount: transactions.length + budgets.length + savingGoals.length
          });
        });

        stream.on('error', (error) => {
          reject({
            success: false,
            error: error.message
          });
        });

        doc.on('error', (error) => {
          reject({
            success: false,
            error: error.message
          });
        });

        doc.end();

      } catch (error) {
        console.error('Financial report PDF export error:', error);
        reject({
          success: false,
          error: error.message
        });
      }
    });
  }
  async cleanupOldExports() {
    try {
      const files = fs.readdirSync(this.exportDir);
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.exportDir, file);
        const stats = fs.statSync(filepath);
        
        if (now - stats.mtime.getTime() > oneDayInMs) {
          fs.unlinkSync(filepath);
          console.log(`Cleaned up old export file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new ExportService();
