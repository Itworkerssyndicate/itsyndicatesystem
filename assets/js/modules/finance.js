// assets/js/modules/finance.js
// النظام المالي المتكامل - إدارة الإيرادات والمصروفات والخزائن

class FinanceSystem {
    constructor(currentUser = null) {
        this.currentUser = currentUser;
        this.transactions = [];
        this.treasuries = {};
        this.budgets = {};
        this.categories = this.loadCategories();
        this.init();
    }

    // ===== 1. تهيئة النظام =====
    async init() {
        await this.loadData();
        this.setupAutoSave();
    }

    // ===== 2. تحميل البيانات =====
    async loadData() {
        try {
            // تحميل المعاملات
            const savedTransactions = localStorage.getItem('finance_transactions');
            if (savedTransactions) {
                this.transactions = JSON.parse(savedTransactions);
            }

            // تحميل الخزائن
            const savedTreasuries = localStorage.getItem('finance_treasuries');
            if (savedTreasuries) {
                this.treasuries = JSON.parse(savedTreasuries);
            }

            // تحميل الميزانيات
            const savedBudgets = localStorage.getItem('finance_budgets');
            if (savedBudgets) {
                this.budgets = JSON.parse(savedBudgets);
            }
        } catch (error) {
            console.error('Error loading finance data:', error);
        }
    }

    // ===== 3. حفظ البيانات =====
    saveData() {
        try {
            localStorage.setItem('finance_transactions', JSON.stringify(this.transactions));
            localStorage.setItem('finance_treasuries', JSON.stringify(this.treasuries));
            localStorage.setItem('finance_budgets', JSON.stringify(this.budgets));
        } catch (error) {
            console.error('Error saving finance data:', error);
        }
    }

    // ===== 4. إعداد الحفظ التلقائي =====
    setupAutoSave() {
        setInterval(() => {
            this.saveData();
        }, 60000); // كل دقيقة
    }

    // ===== 5. تحميل الفئات =====
    loadCategories() {
        return {
            income: {
                membership_fees: 'رسوم عضوية',
                donations: 'تبرعات',
                grants: 'منح',
                investments: 'استثمارات',
                events: 'فعاليات',
                services: 'خدمات',
                other_income: 'إيرادات أخرى'
            },
            expense: {
                salaries: 'رواتب',
                rent: 'إيجار',
                utilities: 'مرافق',
                supplies: 'مستلزمات',
                equipment: 'معدات',
                maintenance: 'صيانة',
                travel: 'سفر',
                training: 'تدريب',
                events: 'فعاليات',
                marketing: 'تسويق',
                other_expense: 'مصروفات أخرى'
            }
        };
    }

    // ===== 6. إنشاء خزينة جديدة =====
    createTreasury(data) {
        const treasury = {
            id: this.generateId('TRS'),
            name: data.name,
            type: data.type, // 'main', 'branch', 'committee'
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            balance: data.initialBalance || 0,
            currency: data.currency || 'EGP',
            description: data.description || '',
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.userId,
            lastTransaction: null,
            transactions: []
        };

        this.treasuries[treasury.id] = treasury;
        this.saveData();
        
        return treasury;
    }

    // ===== 7. إنشاء ميزانية =====
    createBudget(data) {
        const budget = {
            id: this.generateId('BDG'),
            name: data.name,
            type: data.type, // 'annual', 'monthly', 'project'
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            period: {
                start: data.startDate,
                end: data.endDate
            },
            categories: data.categories || {},
            totalAllocated: data.totalAllocated || 0,
            totalSpent: 0,
            totalRemaining: data.totalAllocated || 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.userId
        };

        this.budgets[budget.id] = budget;
        this.saveData();
        
        return budget;
    }

    // ===== 8. إضافة معاملة مالية =====
    addTransaction(data) {
        const transaction = {
            id: this.generateId('TRN'),
            number: this.generateTransactionNumber(data.type),
            type: data.type, // 'income', 'expense', 'transfer'
            category: data.category,
            amount: data.amount,
            description: data.description,
            fromTreasury: data.fromTreasury,
            toTreasury: data.toTreasury,
            fromEntity: data.fromEntity,
            toEntity: data.toEntity,
            paymentMethod: data.paymentMethod, // 'cash', 'bank', 'check', 'online'
            status: 'pending',
            attachments: data.attachments || [],
            notes: data.notes || '',
            tags: data.tags || [],
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.userId,
            approvedBy: null,
            approvedAt: null,
            rejectedBy: null,
            rejectedAt: null,
            rejectionReason: null
        };

        // إضافة المعاملة
        this.transactions.unshift(transaction);

        // تحديث الخزينة
        if (transaction.type === 'income') {
            this.updateTreasuryBalance(transaction.toTreasury, transaction.amount, 'add');
        } else if (transaction.type === 'expense') {
            this.updateTreasuryBalance(transaction.fromTreasury, transaction.amount, 'subtract');
        } else if (transaction.type === 'transfer') {
            this.updateTreasuryBalance(transaction.fromTreasury, transaction.amount, 'subtract');
            this.updateTreasuryBalance(transaction.toTreasury, transaction.amount, 'add');
        }

        // تحديث الميزانية
        if (data.budgetId) {
            this.updateBudgetSpending(data.budgetId, data.category, data.amount);
        }

        this.saveData();

        // إشعار المسؤولين
        this.notifyTreasurers(transaction);

        return transaction;
    }

    // ===== 9. تحديث رصيد الخزينة =====
    updateTreasuryBalance(treasuryId, amount, operation) {
        const treasury = this.treasuries[treasuryId];
        if (!treasury) return false;

        if (operation === 'add') {
            treasury.balance += amount;
        } else if (operation === 'subtract') {
            treasury.balance -= amount;
        }

        treasury.lastTransaction = new Date().toISOString();
        treasury.transactions.push({
            amount,
            operation,
            balance: treasury.balance,
            timestamp: new Date().toISOString()
        });

        return true;
    }

    // ===== 10. تحديث صرف الميزانية =====
    updateBudgetSpending(budgetId, category, amount) {
        const budget = this.budgets[budgetId];
        if (!budget) return false;

        if (!budget.categories[category]) {
            budget.categories[category] = {
                allocated: 0,
                spent: 0,
                remaining: 0
            };
        }

        budget.categories[category].spent += amount;
        budget.categories[category].remaining = 
            budget.categories[category].allocated - budget.categories[category].spent;

        budget.totalSpent += amount;
        budget.totalRemaining = budget.totalAllocated - budget.totalSpent;

        return true;
    }

    // ===== 11. الموافقة على معاملة =====
    approveTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return false;

        transaction.status = 'approved';
        transaction.approvedBy = this.currentUser?.userId;
        transaction.approvedAt = new Date().toISOString();

        this.saveData();
        return true;
    }

    // ===== 12. رفض معاملة =====
    rejectTransaction(transactionId, reason) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return false;

        transaction.status = 'rejected';
        transaction.rejectedBy = this.currentUser?.userId;
        transaction.rejectedAt = new Date().toISOString();
        transaction.rejectionReason = reason;

        // إعادة الرصيد إذا كانت معتمدة مسبقاً
        if (transaction.status === 'approved') {
            if (transaction.type === 'income') {
                this.updateTreasuryBalance(transaction.toTreasury, transaction.amount, 'subtract');
            } else if (transaction.type === 'expense') {
                this.updateTreasuryBalance(transaction.fromTreasury, transaction.amount, 'add');
            } else if (transaction.type === 'transfer') {
                this.updateTreasuryBalance(transaction.fromTreasury, transaction.amount, 'add');
                this.updateTreasuryBalance(transaction.toTreasury, transaction.amount, 'subtract');
            }
        }

        this.saveData();
        return true;
    }

    // ===== 13. إلغاء معاملة =====
    cancelTransaction(transactionId, reason) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return false;

        transaction.status = 'cancelled';
        transaction.cancelledBy = this.currentUser?.userId;
        transaction.cancelledAt = new Date().toISOString();
        transaction.cancellationReason = reason;

        // إعادة الرصيد
        if (transaction.type === 'income') {
            this.updateTreasuryBalance(transaction.toTreasury, transaction.amount, 'subtract');
        } else if (transaction.type === 'expense') {
            this.updateTreasuryBalance(transaction.fromTreasury, transaction.amount, 'add');
        } else if (transaction.type === 'transfer') {
            this.updateTreasuryBalance(transaction.fromTreasury, transaction.amount, 'add');
            this.updateTreasuryBalance(transaction.toTreasury, transaction.amount, 'subtract');
        }

        this.saveData();
        return true;
    }

    // ===== 14. تحويل بين الخزائن =====
    transferFunds(data) {
        return this.addTransaction({
            type: 'transfer',
            fromTreasury: data.fromTreasury,
            toTreasury: data.toTreasury,
            amount: data.amount,
            description: data.description || 'تحويل أموال',
            category: 'transfer',
            paymentMethod: 'transfer',
            notes: data.notes
        });
    }

    // ===== 15. الحصول على رصيد الخزينة =====
    getTreasuryBalance(treasuryId) {
        const treasury = this.treasuries[treasuryId];
        return treasury ? treasury.balance : 0;
    }

    // ===== 16. الحصول على إجمالي الإيرادات =====
    getTotalIncome(period = 'all') {
        const filtered = this.filterByPeriod(
            this.transactions.filter(t => t.type === 'income' && t.status === 'approved'),
            period
        );
        return filtered.reduce((sum, t) => sum + t.amount, 0);
    }

    // ===== 17. الحصول على إجمالي المصروفات =====
    getTotalExpenses(period = 'all') {
        const filtered = this.filterByPeriod(
            this.transactions.filter(t => t.type === 'expense' && t.status === 'approved'),
            period
        );
        return filtered.reduce((sum, t) => sum + t.amount, 0);
    }

    // ===== 18. الحصول على صافي الدخل =====
    getNetIncome(period = 'all') {
        return this.getTotalIncome(period) - this.getTotalExpenses(period);
    }

    // ===== 19. تصفية حسب الفترة =====
    filterByPeriod(transactions, period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'quarter':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return transactions;
        }

        return transactions.filter(t => new Date(t.createdAt) >= startDate);
    }

    // ===== 20. الحصول على تقرير مالي =====
    getFinancialReport(period = 'month') {
        const income = this.getTotalIncome(period);
        const expenses = this.getTotalExpenses(period);
        const net = income - expenses;

        // تفصيل حسب الفئة
        const incomeByCategory = {};
        const expensesByCategory = {};

        this.transactions.filter(t => t.status === 'approved').forEach(t => {
            if (t.type === 'income') {
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            } else if (t.type === 'expense') {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            }
        });

        return {
            period,
            summary: {
                income,
                expenses,
                net,
                profitMargin: income ? (net / income) * 100 : 0
            },
            details: {
                incomeByCategory,
                expensesByCategory
            },
            treasuries: this.treasuries,
            transactions: this.transactions.slice(0, 50) // آخر 50 معاملة
        };
    }

    // ===== 21. إشعار أمناء الصناديق =====
    notifyTreasurers(transaction) {
        // سيتم تنفيذها مع نظام الإشعارات
        console.log('💰 New transaction:', transaction);
    }

    // ===== 22. التحقق من صلاحية المستخدم =====
    canManageFinance() {
        if (!this.currentUser) return false;
        const allowedRoles = ['president', 'treasurer'];
        return allowedRoles.includes(this.currentUser.role);
    }

    // ===== 23. التحقق من صلاحية الخزينة =====
    canAccessTreasury(treasuryId) {
        if (!this.currentUser) return false;
        
        // النقيب يصل للكل
        if (this.currentUser.role === 'president') return true;
        
        // أمين الصندوق يصل للكل
        if (this.currentUser.role === 'treasurer') return true;
        
        const treasury = this.treasuries[treasuryId];
        if (!treasury) return false;
        
        // مدير فرع يصل لخزينة فرعه
        if (this.currentUser.role === 'branch_manager' && 
            treasury.ownerId === this.currentUser.branchId) {
            return true;
        }
        
        return false;
    }

    // ===== 24. توليد رقم معاملة =====
    generateTransactionNumber(type) {
        const prefix = type === 'income' ? 'INC' : type === 'expense' ? 'EXP' : 'TRF';
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const day = new Date().getDate().toString().padStart(2, '0');
        const count = (this.transactions.length + 1).toString().padStart(4, '0');
        
        return `${prefix}-${year}${month}${day}-${count}`;
    }

    // ===== 25. توليد معرف فريد =====
    generateId(prefix) {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===== 26. تصدير التقرير =====
    exportReport(report, format = 'json') {
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'csv') {
            const headers = ['id', 'date', 'type', 'category', 'amount', 'description'];
            const rows = report.transactions.map(t => 
                headers.map(h => t[h] || '').join(',')
            );
            return [headers.join(','), ...rows].join('\n');
        }
    }

    // ===== 27. الحصول على إحصائيات =====
    getStats() {
        return {
            totalTransactions: this.transactions.length,
            pendingTransactions: this.transactions.filter(t => t.status === 'pending').length,
            approvedTransactions: this.transactions.filter(t => t.status === 'approved').length,
            totalTreasuries: Object.keys(this.treasuries).length,
            totalBudgets: Object.keys(this.budgets).length,
            totalIncome: this.getTotalIncome('all'),
            totalExpenses: this.getTotalExpenses('all'),
            netBalance: this.getNetIncome('all')
        };
    }

    // ===== 28. مزامنة مع الخادم =====
    async syncWithServer() {
        // سيتم تنفيذها عند الاتصال بالخادم
    }
}

export default FinanceSystem;
