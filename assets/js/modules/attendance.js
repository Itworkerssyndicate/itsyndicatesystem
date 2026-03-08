// assets/js/modules/attendance.js
// نظام الحضور والانصراف المتقدم مع تتبع المواقع والأجهزة

class AttendanceSystem {
    constructor(currentUser = null) {
        this.currentUser = currentUser;
        this.today = new Date().toDateString();
        this.attendance = [];
        this.workingHours = {
            start: '09:00',
            end: '17:00',
            gracePeriod: 15, // دقائق سماح
            minHours: 8,
            breakTime: 60 // دقيقة استراحة
        };
        this.locationTracking = false;
        this.deviceTracking = true;
        this.init();
    }

    // ===== 1. تهيئة النظام =====
    async init() {
        await this.loadAttendance();
        this.checkCurrentStatus();
        this.setupAutoCheckout();
    }

    // ===== 2. تحميل سجلات الحضور =====
    async loadAttendance() {
        try {
            const saved = localStorage.getItem(`attendance_${this.currentUser?.userId || 'guest'}`);
            if (saved) {
                this.attendance = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }

    // ===== 3. حفظ سجلات الحضور =====
    saveAttendance() {
        try {
            localStorage.setItem(
                `attendance_${this.currentUser?.userId || 'guest'}`,
                JSON.stringify(this.attendance)
            );
        } catch (error) {
            console.error('Error saving attendance:', error);
        }
    }

    // ===== 4. التحقق من الحالة الحالية =====
    checkCurrentStatus() {
        const today = this.getTodayRecord();
        if (today) {
            if (today.checkIn && !today.checkOut) {
                this.updateStatus('checked-in');
            } else if (today.checkIn && today.checkOut) {
                this.updateStatus('checked-out');
            }
        }
    }

    // ===== 5. تحديث حالة المستخدم =====
    updateStatus(status) {
        this.currentStatus = status;
        
        // تحديث الواجهة
        const statusElement = document.getElementById('attendanceStatus');
        if (statusElement) {
            statusElement.className = `status-${status}`;
            statusElement.textContent = status === 'checked-in' ? '🟢 حاضر' : '🔴 منصرف';
        }
    }

    // ===== 6. تسجيل حضور =====
    async checkIn(location = null) {
        try {
            // التحقق من عدم تسجيل حضور مسبق
            const today = this.getTodayRecord();
            if (today && today.checkIn) {
                return {
                    success: false,
                    error: 'تم تسجيل الحضور مسبقاً اليوم'
                };
            }

            // الحصول على الموقع إذا لم يتم توفيره
            if (this.locationTracking && !location) {
                location = await this.getCurrentLocation();
            }

            // الحصول على معلومات الجهاز
            const device = this.deviceTracking ? this.getDeviceInfo() : null;

            const record = {
                id: this.generateId(),
                userId: this.currentUser?.userId,
                userName: this.currentUser?.fullName,
                date: this.today,
                checkIn: new Date().toISOString(),
                checkOut: null,
                location: location,
                device: device,
                status: this.calculateStatus(),
                notes: '',
                overtime: 0,
                late: 0,
                earlyDeparture: 0
            };

            // حساب التأخير
            record.late = this.calculateLate(record.checkIn);

            this.attendance.unshift(record);
            this.saveAttendance();
            this.updateStatus('checked-in');

            // إشعار
            await this.sendNotification('checkin', record);

            return {
                success: true,
                record: record,
                message: 'تم تسجيل الحضور بنجاح'
            };

        } catch (error) {
            console.error('Error checking in:', error);
            return {
                success: false,
                error: 'حدث خطأ في تسجيل الحضور'
            };
        }
    }

    // ===== 7. تسجيل انصراف =====
    async checkOut() {
        try {
            const today = this.getTodayRecord();
            
            if (!today || !today.checkIn) {
                return {
                    success: false,
                    error: 'لم يتم تسجيل حضور اليوم'
                };
            }

            if (today.checkOut) {
                return {
                    success: false,
                    error: 'تم تسجيل الانصراف مسبقاً'
                };
            }

            today.checkOut = new Date().toISOString();
            
            // حساب ساعات العمل
            const workedHours = this.calculateWorkedHours(today.checkIn, today.checkOut);
            today.workedHours = workedHours;
            
            // حساب ساعات إضافية
            today.overtime = this.calculateOvertime(workedHours);
            
            // حساب انصراف مبكر
            today.earlyDeparture = this.calculateEarlyDeparture(today.checkOut);

            this.saveAttendance();
            this.updateStatus('checked-out');

            // إشعار
            await this.sendNotification('checkout', today);

            return {
                success: true,
                record: today,
                workedHours: workedHours,
                message: 'تم تسجيل الانصراف بنجاح'
            };

        } catch (error) {
            console.error('Error checking out:', error);
            return {
                success: false,
                error: 'حدث خطأ في تسجيل الانصراف'
            };
        }
    }

    // ===== 8. الحصول على سجل اليوم =====
    getTodayRecord() {
        return this.attendance.find(r => r.date === this.today);
    }

    // ===== 9. إعداد الخروج التلقائي =====
    setupAutoCheckout() {
        // التحقق كل دقيقة إذا كان المستخدم لا يزال مسجلاً
        setInterval(() => {
            const today = this.getTodayRecord();
            if (today && today.checkIn && !today.checkOut) {
                const checkInTime = new Date(today.checkIn);
                const now = new Date();
                const hoursWorked = (now - checkInTime) / (1000 * 60 * 60);
                
                // إذا مر أكثر من 12 ساعة، خروج تلقائي
                if (hoursWorked > 12) {
                    this.autoCheckout('تجاوز الحد الأقصى لساعات العمل');
                }
            }
        }, 60000);
    }

    // ===== 10. خروج تلقائي =====
    async autoCheckout(reason) {
        const today = this.getTodayRecord();
        if (today && !today.checkOut) {
            today.checkOut = new Date().toISOString();
            today.autoCheckout = true;
            today.autoCheckoutReason = reason;
            
            this.saveAttendance();
            this.updateStatus('checked-out');
            
            await this.sendNotification('auto_checkout', today);
        }
    }

    // ===== 11. حساب ساعات العمل =====
    calculateWorkedHours(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = (end - start) / (1000 * 60 * 60); // بالساعات
        
        // طرح وقت الاستراحة
        const breakHours = this.workingHours.breakTime / 60;
        return Math.max(0, diff - breakHours);
    }

    // ===== 12. حساب التأخير =====
    calculateLate(checkIn) {
        const checkInTime = new Date(checkIn);
        const [hours, minutes] = this.workingHours.start.split(':').map(Number);
        const workStart = new Date(checkInTime);
        workStart.setHours(hours, minutes + this.workingHours.gracePeriod, 0);

        if (checkInTime > workStart) {
            const lateMinutes = (checkInTime - workStart) / (1000 * 60);
            return Math.round(lateMinutes);
        }

        return 0;
    }

    // ===== 13. حساب ساعات إضافية =====
    calculateOvertime(workedHours) {
        return Math.max(0, workedHours - this.workingHours.minHours);
    }

    // ===== 14. حساب انصراف مبكر =====
    calculateEarlyDeparture(checkOut) {
        const checkOutTime = new Date(checkOut);
        const [hours, minutes] = this.workingHours.end.split(':').map(Number);
        const workEnd = new Date(checkOutTime);
        workEnd.setHours(hours, minutes, 0);

        if (checkOutTime < workEnd) {
            const earlyMinutes = (workEnd - checkOutTime) / (1000 * 60);
            return Math.round(earlyMinutes);
        }

        return 0;
    }

    // ===== 15. حساب الحالة =====
    calculateStatus() {
        const today = this.getTodayRecord();
        if (!today) return 'absent';
        if (today.checkIn && !today.checkOut) return 'present';
        if (today.checkIn && today.checkOut) return 'completed';
        return 'absent';
    }

    // ===== 16. الحصول على الموقع الحالي =====
    async getCurrentLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                () => resolve(null),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    // ===== 17. الحصول على معلومات الجهاز =====
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookies: navigator.cookieEnabled,
            online: navigator.onLine
        };
    }

    // ===== 18. إرسال إشعار =====
    async sendNotification(type, data) {
        // سيتم تنفيذها مع نظام الإشعارات
        console.log(`📢 Attendance ${type}:`, data);
    }

    // ===== 19. الحصول على تقرير يومي =====
    getDailyReport(date = null) {
        const targetDate = date ? new Date(date).toDateString() : this.today;
        const records = this.attendance.filter(r => r.date === targetDate);
        
        const present = records.filter(r => r.checkIn).length;
        const absent = records.filter(r => !r.checkIn).length;
        const late = records.filter(r => r.late > 0).length;

        return {
            date: targetDate,
            total: records.length,
            present,
            absent,
            late,
            records: records
        };
    }

    // ===== 20. الحصول على تقرير شهري =====
    getMonthlyReport(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const records = this.attendance.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate >= startDate && recordDate <= endDate;
        });

        // تجميع حسب اليوم
        const daily = {};
        records.forEach(r => {
            daily[r.date] = r;
        });

        // حساب الإحصائيات
        const stats = {
            totalDays: records.length,
            presentDays: records.filter(r => r.checkIn).length,
            absentDays: records.filter(r => !r.checkIn).length,
            totalLate: records.reduce((sum, r) => sum + r.late, 0),
            totalOvertime: records.reduce((sum, r) => sum + r.overtime, 0),
            avgWorkedHours: records.reduce((sum, r) => sum + (r.workedHours || 0), 0) / records.length || 0
        };

        return {
            year,
            month,
            stats,
            daily,
            records
        };
    }

    // ===== 21. إضافة ملاحظة =====
    addNote(date, note) {
        const record = this.attendance.find(r => r.date === date);
        if (record) {
            record.notes = note;
            this.saveAttendance();
            return true;
        }
        return false;
    }

    // ===== 22. تصحيح سجل =====
    async correctRecord(date, corrections) {
        // للرؤساء فقط
        if (!this.canCorrect()) {
            return {
                success: false,
                error: 'ليس لديك صلاحية لتصحيح السجلات'
            };
        }

        const record = this.attendance.find(r => r.date === date);
        if (record) {
            Object.assign(record, corrections);
            record.corrected = true;
            record.correctedBy = this.currentUser?.userId;
            record.correctedAt = new Date().toISOString();
            
            this.saveAttendance();
            
            return {
                success: true,
                record: record
            };
        }

        return {
            success: false,
            error: 'السجل غير موجود'
        };
    }

    // ===== 23. التحقق من صلاحية التصحيح =====
    canCorrect() {
        if (!this.currentUser) return false;
        const allowedRoles = ['president', 'vice_president_first', 'branch_manager'];
        return allowedRoles.includes(this.currentUser.role);
    }

    // ===== 24. تصدير التقرير =====
    exportReport(report, format = 'json') {
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'csv') {
            const headers = ['date', 'checkIn', 'checkOut', 'workedHours', 'late', 'overtime', 'status'];
            const rows = report.records.map(r => 
                headers.map(h => r[h] || '').join(',')
            );
            return [headers.join(','), ...rows].join('\n');
        }
    }

    // ===== 25. إحصائيات الحضور =====
    getStats() {
        return {
            total: this.attendance.length,
            present: this.attendance.filter(r => r.checkIn).length,
            absent: this.attendance.filter(r => !r.checkIn).length,
            late: this.attendance.filter(r => r.late > 0).length,
            overtime: this.attendance.reduce((sum, r) => sum + r.overtime, 0),
            averageWorked: this.attendance.reduce((sum, r) => sum + (r.workedHours || 0), 0) / this.attendance.length || 0,
            currentStatus: this.currentStatus
        };
    }

    // ===== 26. توليد معرف فريد =====
    generateId() {
        return 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===== 27. إعادة تعيين النظام =====
    reset() {
        this.attendance = [];
        this.currentStatus = null;
        this.saveAttendance();
    }

    // ===== 28. مزامنة مع الخادم =====
    async syncWithServer() {
        // سيتم تنفيذها عند الاتصال بالخادم
    }
}

export default AttendanceSystem;
