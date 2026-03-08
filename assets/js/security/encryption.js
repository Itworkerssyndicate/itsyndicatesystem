// assets/js/security/encryption.js
// نظام التشفير المحلي المتقدم للبيانات الحساسة

class EncryptionManager {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyUsages = ['encrypt', 'decrypt'];
        this.keyCache = new Map();
        this.supported = this.checkSupport();
        this.defaultIterations = 100000;
        this.keyLength = 256;
    }

    // ===== 1. التحقق من دعم Web Crypto API =====
    checkSupport() {
        const supported = window.crypto && window.crypto.subtle;
        if (!supported) {
            console.warn('⚠️ Web Crypto API غير مدعوم في هذا المتصفح');
        }
        return supported;
    }

    // ===== 2. توليد مفتاح تشفير عشوائي =====
    async generateKey() {
        try {
            if (!this.supported) {
                return this.fallbackGenerateKey();
            }

            const key = await crypto.subtle.generateKey(
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                true,
                this.keyUsages
            );
            
            // تصدير المفتاح بتنسيق base64 للتخزين
            const exportedKey = await crypto.subtle.exportKey('raw', key);
            const exportedKeyBase64 = this.arrayBufferToBase64(exportedKey);
            
            return {
                success: true,
                key: key,
                base64: exportedKeyBase64
            };
        } catch (error) {
            console.error('Error generating key:', error);
            return this.fallbackGenerateKey();
        }
    }

    // ===== 3. طريقة احتياطية لتوليد المفتاح =====
    fallbackGenerateKey() {
        // استخدام طريقة simpler في حالة عدم دعم Web Crypto
        const randomBytes = this.generateRandomBytes(32);
        const base64Key = this.arrayBufferToBase64(randomBytes);
        
        return {
            success: true,
            key: base64Key,
            base64: base64Key,
            fallback: true
        };
    }

    // ===== 4. استيراد مفتاح من base64 =====
    async importKey(base64Key) {
        try {
            if (!this.supported) {
                return base64Key;
            }

            // التحقق من وجود المفتاح في الكاش
            if (this.keyCache.has(base64Key)) {
                return this.keyCache.get(base64Key);
            }

            const keyData = this.base64ToArrayBuffer(base64Key);
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                true,
                this.keyUsages
            );

            // حفظ في الكاش
            this.keyCache.set(base64Key, key);
            
            return key;
        } catch (error) {
            console.error('Error importing key:', error);
            return base64Key;
        }
    }

    // ===== 5. تشفير البيانات =====
    async encryptData(plaintext, key) {
        try {
            if (!this.supported) {
                return this.fallbackEncrypt(plaintext, key);
            }

            // توليد initialization vector عشوائي
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // تحويل النص إلى Uint8Array
            const encodedPlaintext = new TextEncoder().encode(JSON.stringify(plaintext));
            
            // الحصول على المفتاح
            let cryptoKey;
            if (typeof key === 'string') {
                cryptoKey = await this.importKey(key);
            } else {
                cryptoKey = key;
            }
            
            // تشفير البيانات
            const ciphertext = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                cryptoKey,
                encodedPlaintext
            );
            
            // إرجاع النص المشفر مع IV
            return {
                success: true,
                data: {
                    ciphertext: this.arrayBufferToBase64(ciphertext),
                    iv: this.arrayBufferToBase64(iv),
                    algorithm: this.algorithm
                }
            };
        } catch (error) {
            console.error('Error encrypting data:', error);
            return this.fallbackEncrypt(plaintext, key);
        }
    }

    // ===== 6. طريقة احتياطية للتشفير =====
    fallbackEncrypt(plaintext, key) {
        // تشفير بسيط باستخدام Base64
        const jsonString = JSON.stringify(plaintext);
        const encoded = btoa(encodeURIComponent(jsonString));
        
        return {
            success: true,
            data: {
                ciphertext: encoded,
                iv: 'none',
                algorithm: 'base64',
                fallback: true
            }
        };
    }

    // ===== 7. فك تشفير البيانات =====
    async decryptData(encryptedData, key) {
        try {
            const { ciphertext, iv, algorithm } = encryptedData;

            // استخدام الطريقة الاحتياطية إذا كانت base64
            if (algorithm === 'base64' || !this.supported) {
                return this.fallbackDecrypt(ciphertext);
            }

            // تحويل من base64
            const ciphertextBytes = this.base64ToArrayBuffer(ciphertext);
            const ivBytes = this.base64ToArrayBuffer(iv);
            
            // الحصول على المفتاح
            let cryptoKey;
            if (typeof key === 'string') {
                cryptoKey = await this.importKey(key);
            } else {
                cryptoKey = key;
            }
            
            // فك التشفير
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: ivBytes
                },
                cryptoKey,
                ciphertextBytes
            );
            
            // تحويل النص المفكوك
            const decoded = new TextDecoder().decode(decrypted);
            return {
                success: true,
                data: JSON.parse(decoded)
            };
        } catch (error) {
            console.error('Error decrypting data:', error);
            return this.fallbackDecrypt(encryptedData.ciphertext);
        }
    }

    // ===== 8. طريقة احتياطية لفك التشفير =====
    fallbackDecrypt(encoded) {
        try {
            const decoded = decodeURIComponent(atob(encoded));
            return {
                success: true,
                data: JSON.parse(decoded)
            };
        } catch (error) {
            return {
                success: false,
                error: 'فشل فك التشفير'
            };
        }
    }

    // ===== 9. تشفير ملف =====
    async encryptFile(file, key) {
        try {
            const fileData = await file.arrayBuffer();
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            let cryptoKey;
            if (typeof key === 'string') {
                cryptoKey = await this.importKey(key);
            } else {
                cryptoKey = key;
            }
            
            const encryptedFile = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                cryptoKey,
                fileData
            );
            
            return {
                success: true,
                data: {
                    encryptedData: this.arrayBufferToBase64(encryptedFile),
                    iv: this.arrayBufferToBase64(iv),
                    originalName: file.name,
                    type: file.type,
                    size: file.size,
                    algorithm: this.algorithm
                }
            };
        } catch (error) {
            console.error('Error encrypting file:', error);
            return {
                success: false,
                error: 'فشل تشفير الملف'
            };
        }
    }

    // ===== 10. فك تشفير ملف =====
    async decryptFile(encryptedFile, key) {
        try {
            const { encryptedData, iv, originalName, type, algorithm } = encryptedFile;
            
            const encryptedBytes = this.base64ToArrayBuffer(encryptedData);
            const ivBytes = this.base64ToArrayBuffer(iv);
            
            let cryptoKey;
            if (typeof key === 'string') {
                cryptoKey = await this.importKey(key);
            } else {
                cryptoKey = key;
            }
            
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: algorithm,
                    iv: ivBytes
                },
                cryptoKey,
                encryptedBytes
            );
            
            // إنشاء ملف جديد
            const decryptedFile = new File(
                [decryptedData],
                originalName,
                { type: type }
            );
            
            return {
                success: true,
                file: decryptedFile
            };
        } catch (error) {
            console.error('Error decrypting file:', error);
            return {
                success: false,
                error: 'فشل فك تشفير الملف'
            };
        }
    }

    // ===== 11. تخزين آمن في localStorage =====
    async secureStore(key, value, encryptionKey) {
        try {
            const encrypted = await this.encryptData(value, encryptionKey);
            localStorage.setItem(`secure_${key}`, JSON.stringify(encrypted.data));
            return true;
        } catch (error) {
            console.error('Error storing securely:', error);
            return false;
        }
    }

    // ===== 12. استرجاع آمن من localStorage =====
    async secureRetrieve(key, encryptionKey) {
        try {
            const stored = localStorage.getItem(`secure_${key}`);
            if (!stored) return null;
            
            const encryptedData = JSON.parse(stored);
            const decrypted = await this.decryptData(encryptedData, encryptionKey);
            
            return decrypted.success ? decrypted.data : null;
        } catch (error) {
            console.error('Error retrieving securely:', error);
            return null;
        }
    }

    // ===== 13. تشفير البيانات الحساسة للمستخدم =====
    async encryptUserData(userData, userKey) {
        const sensitiveFields = [
            'nationalId',
            'phone',
            'email',
            'address',
            'appointmentNumber',
            'bankAccount',
            'salary',
            'personalNotes',
            'password',
            'securityQuestions'
        ];

        const encryptedData = {};
        
        for (const field of sensitiveFields) {
            if (userData[field]) {
                const encrypted = await this.encryptData(userData[field], userKey);
                encryptedData[field] = encrypted.data;
            }
        }

        return encryptedData;
    }

    // ===== 14. فك تشفير بيانات المستخدم =====
    async decryptUserData(encryptedData, userKey) {
        const decryptedData = {};
        
        for (const [field, encrypted] of Object.entries(encryptedData)) {
            const decrypted = await this.decryptData(encrypted, userKey);
            if (decrypted.success) {
                decryptedData[field] = decrypted.data;
            }
        }

        return decryptedData;
    }

    // ===== 15. توليد مفتاح للمستخدم بناءً على كلمة المرور =====
    async generateUserKey(password, salt) {
        try {
            if (!this.supported) {
                return this.fallbackGenerateUserKey(password, salt);
            }

            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);
            const saltData = encoder.encode(salt);
            
            // استخدام PBKDF2 لتوليد مفتاح من كلمة المرور
            const baseKey = await crypto.subtle.importKey(
                'raw',
                passwordData,
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltData,
                    iterations: this.defaultIterations,
                    hash: 'SHA-256'
                },
                baseKey,
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                true,
                this.keyUsages
            );
            
            // تصدير المفتاح للتخزين
            const exportedKey = await crypto.subtle.exportKey('raw', key);
            const exportedKeyBase64 = this.arrayBufferToBase64(exportedKey);
            
            return {
                success: true,
                key: key,
                base64: exportedKeyBase64
            };
        } catch (error) {
            console.error('Error generating user key:', error);
            return this.fallbackGenerateUserKey(password, salt);
        }
    }

    // ===== 16. طريقة احتياطية لتوليد مفتاح المستخدم =====
    fallbackGenerateUserKey(password, salt) {
        // توليد مفتاح بسيط من كلمة المرور والملح
        const combined = password + salt;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const keyString = Math.abs(hash).toString(16).padStart(64, '0');
        
        return {
            success: true,
            key: keyString,
            base64: keyString,
            fallback: true
        };
    }

    // ===== 17. توليد ملح عشوائي =====
    generateSalt() {
        const randomBytes = this.generateRandomBytes(16);
        return this.arrayBufferToBase64(randomBytes);
    }

    // ===== 18. توليد بايتات عشوائية =====
    generateRandomBytes(length) {
        const array = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(array);
        } else {
            // طريقة احتياطية
            for (let i = 0; i < length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return array.buffer;
    }

    // ===== 19. تحويل ArrayBuffer إلى Base64 =====
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // ===== 20. تحويل Base64 إلى ArrayBuffer =====
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // ===== 21. توقيع البيانات (للتأكد من عدم التلاعب) =====
    async signData(data, key) {
        try {
            if (!this.supported) {
                return this.fallbackSign(data);
            }

            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(JSON.stringify(data));
            
            let cryptoKey;
            if (typeof key === 'string') {
                // استخدام مفتاح HMAC بسيط
                const keyData = encoder.encode(key);
                cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['sign']
                );
            } else {
                cryptoKey = key;
            }
            
            const signature = await crypto.subtle.sign(
                {
                    name: 'HMAC',
                    hash: 'SHA-256'
                },
                cryptoKey,
                dataBytes
            );
            
            return {
                success: true,
                signature: this.arrayBufferToBase64(signature)
            };
        } catch (error) {
            console.error('Error signing data:', error);
            return this.fallbackSign(data);
        }
    }

    // ===== 22. طريقة احتياطية للتوقيع =====
    fallbackSign(data) {
        const jsonString = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return {
            success: true,
            signature: Math.abs(hash).toString(16)
        };
    }

    // ===== 23. التحقق من التوقيع =====
    async verifySignature(data, signature, key) {
        try {
            if (!this.supported) {
                return this.fallbackVerify(data, signature);
            }

            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(JSON.stringify(data));
            const signatureBytes = this.base64ToArrayBuffer(signature);
            
            let cryptoKey;
            if (typeof key === 'string') {
                const keyData = encoder.encode(key);
                cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['verify']
                );
            } else {
                cryptoKey = key;
            }
            
            const isValid = await crypto.subtle.verify(
                {
                    name: 'HMAC',
                    hash: 'SHA-256'
                },
                cryptoKey,
                signatureBytes,
                dataBytes
            );
            
            return {
                success: true,
                isValid: isValid
            };
        } catch (error) {
            console.error('Error verifying signature:', error);
            return this.fallbackVerify(data, signature);
        }
    }

    // ===== 24. طريقة احتياطية للتحقق =====
    fallbackVerify(data, signature) {
        const expected = this.fallbackSign(data).signature;
        return {
            success: true,
            isValid: expected === signature
        };
    }

    // ===== 25. مسح البيانات الحساسة من الذاكرة =====
    wipeSensitiveData(data) {
        if (typeof data === 'string') {
            // محاولة مسح النص من الذاكرة (ليس مضموناً 100%)
            data = null;
        } else if (Array.isArray(data)) {
            data.length = 0;
        } else if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'string') {
                    data[key] = null;
                }
            });
        }
    }

    // ===== 26. الحصول على إحصائيات التشفير =====
    getStats() {
        return {
            supported: this.supported,
            algorithm: this.algorithm,
            keyLength: this.keyLength,
            cachedKeys: this.keyCache.size,
            fallbackMode: !this.supported
        };
    }

    // ===== 27. مسح الكاش =====
    clearCache() {
        this.keyCache.clear();
    }
}

export default EncryptionManager;
