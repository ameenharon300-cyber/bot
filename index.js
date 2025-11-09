
// ===================================================
// 🚀 AI GOAL PREDICTOR ULTIMATE - VERSION 10.5 (GEMINI UPDATE)
// 👤 DEVELOPER: AMIN - @GEMZGOOLBOT
// 🔥 FEATURES: SMART AI + GEMINI IMAGE VALIDATION + BETTING SYSTEM + FIREBASE + FULL ADMIN PANEL
// ===================================================

console.log('🤖 Starting AI GOAL Predictor Ultimate v10.5...');
console.log('🕒 ' + new Date().toISOString());

// 🔧 CONFIGURATION
const CONFIG = {
    BOT_TOKEN: process.env.BOT_TOKEN || "8125363786:AAFZaOGSAvq_p8Sc8cq2bIKZlpe4ej7tmdU",
    ADMIN_ID: process.env.ADMIN_ID || "6565594143",
    
    // 🧠 AI APIS
    AI_APIS: {
        // IMPORTANT: Ensure your Gemini API Key is set in environment variables
        GEMINI: process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE",
    },

    // 💰 DEFAULT PRICING
    SUBSCRIPTION_PRICES: {
        week: 10,
        month: 30,
        three_months: 80,
        year: 250
    },

    // 🔐 DEFAULT PAYMENT LINKS
    PAYMENT_LINKS: {
        week: process.env.PAYMENT_WEEK || "https://binance.com/payment/weekly",
        month: process.env.PAYMENT_MONTH || "https://binance.com/payment/monthly", 
        three_months: process.env.PAYMENT_3MONTHS || "https://binance.com/payment/3months",
        year: process.env.PAYMENT_YEAR || "https://binance.com/payment/yearly"
    },
    
    VERSION: "10.5.0",
    DEVELOPER: "AMIN - @GEMZGOOLBOT",
    CHANNEL: "@GEMZGOOL",
    START_IMAGE: "https://i.ibb.co/tpy70Bd1/IMG-20251104-074214-065.jpg",
    ANALYSIS_IMAGE: "https://i.ibb.co/VYjf05S0/Screenshot.png",
    IMGBB_API_KEY: "42b155a527bee21e62e524a31fe9b1ee"
};

console.log('✅ Configuration loaded successfully');

// 🚀 INITIALIZE BOT & LIBRARIES
const { Telegraf, Markup, session } = require('telegraf');
const axios = require('axios');
const express = require('express');
const { GoogleGenAI } = require('@google/genai'); // Gemini API

const bot = new Telegraf(CONFIG.BOT_TOKEN);
const ai = new GoogleGenAI({ apiKey: CONFIG.AI_APIS.GEMINI });

// 🌐 HEALTH CHECK SERVER FOR REPLIT
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        version: CONFIG.VERSION,
        timestamp: new Date().toISOString(),
        message: 'AI Goal Predictor Bot is running...',
        developer: CONFIG.DEVELOPER
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
});

// 🔥 FIREBASE INITIALIZATION
let db = null;
let admin = null;

try {
    admin = require('firebase-admin');
    
    // Ensure Firebase environment variables are correctly set for this to work
    const serviceAccount = {
        "type": "service_account",
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.FIREBASE_CERT_URL
    };

    if (serviceAccount.private_key && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log('✅ Firebase initialized successfully');
    } else {
        throw new Error('Firebase credentials not found in environment variables.');
    }
} catch (error) {
    console.log('⚠️ Firebase initialization failed:', error.message);
    console.log('🔄 Using local storage instead. Data will not be persistent.');
}

// 🗄️ LOCAL STORAGE FALLBACK
const userDatabase = new Map();
const paymentDatabase = new Map();
const settingsDatabase = new Map();

// Initialize default settings for local fallback
settingsDatabase.set('config', {
    prices: { ...CONFIG.SUBSCRIPTION_PRICES },
    payment_links: { ...CONFIG.PAYMENT_LINKS },
    maintenance_mode: false,
    updated_at: new Date().toISOString()
});

// 📊 FAKE STATISTICS SYSTEM (For display purposes)
class FakeStatistics {
    constructor() {
        this.totalUsers = 78542;
        this.activeUsers = 287;
    }

    getStats() {
        return {
            totalUsers: this.totalUsers,
            activeUsers: this.activeUsers
        };
    }
}

// 🧠 GOAL PREDICTION ENGINE WITH GEMINI VALIDATION
class GoalPredictionAI {
    constructor() {
        this.algorithmVersion = "10.5";
    }

    /**
     * Converts an image URL to a base64 string.
     * @param {string} url The URL of the image.
     * @returns {Promise<string>} The base64 encoded image data.
     */
    async imageUrlToBase64(url) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
    }

    /**
     * Validates the game image using Gemini Vision API.
     * @param {string} base64ImageData The base64 encoded image.
     * @returns {Promise<boolean>} True if the image is valid, false otherwise.
     */
    async validateGameImageWithAI(base64ImageData) {
        try {
            const model = ai.models['gemini-2.5-flash'];
            const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64ImageData,
                },
            };
            const textPart = {
                text: `Analyze this image. Does it meet ALL these criteria for a betting game screen?
                1. Features two famous soccer players (like Messi, Neymar, Ronaldo).
                2. Contains the big stylized word "GOAL!".
                3. Has two colored buttons, one for "Goal" (هدف) and one for "No Goal" (لا هدف).
                4. Has a button to place a bet (like "وضع الرهان").
                Respond with ONLY "VALID" or "INVALID".`
            };
            
            const response = await model.generateContent({
                contents: { parts: [imagePart, textPart] },
            });

            const resultText = response.text.trim().toUpperCase();
            console.log(`Gemini validation result: ${resultText}`);
            return resultText === 'VALID';

        } catch (error) {
            console.error('Error calling Gemini API for validation:', error);
            // In case of API error, we consider it invalid to be safe.
            return false;
        }
    }

    generateSmartPrediction(userId) {
        const isGoal = Math.random() > 0.5;
        const probability = Math.floor(Math.random() * 30) + 60;
        
        return {
            type: isGoal ? '⚽ هدف مؤكد' : '🛡️ دفاع قوي',
            probability: probability,
            confidence: 100,
            reasoning: isGoal ? 
                `🔥 الضغط الهجومي المستمر يشير لهدف قريب بنسبة ${probability}%` :
                `🛡️ الدفاع المنظم يحد من الفرص بنسبة ${probability}%`,
            timestamp: new Date().toISOString(),
            algorithm: this.algorithmVersion
        };
    }

    /**
     * Main analysis function: first validates, then predicts.
     * @param {string} imageUrl The URL of the image to analyze.
     * @returns {Promise<object>} The prediction object.
     * @throws {Error} if the image is invalid.
     */
    async analyzeImage(imageUrl) {
        const base64Image = await this.imageUrlToBase64(imageUrl);
        const isValid = await this.validateGameImageWithAI(base64Image);

        if (!isValid) {
            throw new Error('INVALID_IMAGE');
        }

        // If valid, proceed to generate the prediction.
        return this.generateSmartPrediction('image_analysis');
    }

    generateNextPrediction(userId) {
        return this.generateSmartPrediction(userId);
    }
}


// 📤 IMGBB UPLOADER (Simplified for example)
class ImgBBUploader {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async uploadImage(imageUrl) {
        // In a real scenario, you'd use the API. For this purpose, we just return the URL.
        return { success: true, url: imageUrl, delete_url: imageUrl };
    }
}

// 💾 DATABASE MANAGER
class DatabaseManager {
    constructor() {
        this.maintenanceMode = false;
    }

    async getUser(userId) {
        try {
            if (db) {
                const userDoc = await db.collection('users').doc(userId.toString()).get();
                return userDoc.exists ? userDoc.data() : null;
            }
            return userDatabase.get(userId) || null;
        } catch (error) {
            console.error('DB Error getUser:', error.message);
            return userDatabase.get(userId) || null;
        }
    }

    async saveUser(userId, userData) {
        try {
            if (db) {
                await db.collection('users').doc(userId.toString()).set(userData, { merge: true });
            } else {
                 userDatabase.set(userId, {...userDatabase.get(userId), ...userData});
            }
            return true;
        } catch (error) {
            console.error('DB Error saveUser:', error.message);
            userDatabase.set(userId, {...userDatabase.get(userId), ...userData});
            return true;
        }
    }
    
    async addPayment(paymentData) {
        const paymentId = Date.now().toString();
        const fullPaymentData = { ...paymentData, id: paymentId, status: 'pending', timestamp: new Date().toISOString() };
        try {
            if (db) {
                await db.collection('payments').doc(paymentId).set(fullPaymentData);
            } else {
                 paymentDatabase.set(paymentId, fullPaymentData);
            }
            return paymentId;
        } catch (error) {
            console.error('DB Error addPayment:', error.message);
            paymentDatabase.set(paymentId, fullPaymentData);
            return paymentId;
        }
    }

    async getPendingPayments() {
        try {
            if (db) {
                const snapshot = await db.collection('payments').where('status', '==', 'pending').get();
                return snapshot.docs.map(doc => doc.data());
            }
            return Array.from(paymentDatabase.values()).filter(p => p.status === 'pending');
        } catch (error) {
            console.error('DB Error getPendingPayments:', error.message);
            return Array.from(paymentDatabase.values()).filter(p => p.status === 'pending');
        }
    }

    async updatePayment(paymentId, updates) {
        try {
            if (db) {
                await db.collection('payments').doc(paymentId).update(updates);
            } else {
                const payment = paymentDatabase.get(paymentId);
                if (payment) paymentDatabase.set(paymentId, { ...payment, ...updates });
            }
            return true;
        } catch (error) {
            console.error('DB Error updatePayment:', error.message);
            const payment = paymentDatabase.get(paymentId);
            if (payment) paymentDatabase.set(paymentId, { ...payment, ...updates });
            return true;
        }
    }

    async getAllUsers() {
        try {
            if (db) {
                const snapshot = await db.collection('users').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            return Array.from(userDatabase.entries()).map(([id, data]) => ({ id, ...data }));
        } catch (error) {
            console.error('DB Error getAllUsers:', error.message);
            return Array.from(userDatabase.entries()).map(([id, data]) => ({ id, ...data }));
        }
    }

    async getSettings() {
        try {
            if (db) {
                const doc = await db.collection('settings').doc('config').get();
                if (doc.exists) {
                    const data = doc.data();
                    // Merge with defaults to prevent crashes if some settings are missing
                    return {
                        prices: {...CONFIG.SUBSCRIPTION_PRICES, ...data.prices},
                        payment_links: {...CONFIG.PAYMENT_LINKS, ...data.payment_links},
                        maintenance_mode: data.maintenance_mode || false,
                        updated_at: data.updated_at
                    };
                }
            }
             // Return local/default if firebase fails or doc doesn't exist
            return settingsDatabase.get('config');
        } catch (error) {
            console.error('DB Error getSettings:', error.message);
            return settingsDatabase.get('config');
        }
    }

    async updateSettings(newSettings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...newSettings,
            prices: {...currentSettings.prices, ...newSettings.prices},
            payment_links: {...currentSettings.payment_links, ...newSettings.payment_links},
            updated_at: new Date().toISOString()
        };
        try {
            if (db) {
                await db.collection('settings').doc('config').set(updatedSettings, { merge: true });
            }
             settingsDatabase.set('config', updatedSettings);
            return updatedSettings;
        } catch (error) {
            console.error('DB Error updateSettings:', error.message);
            settingsDatabase.set('config', updatedSettings);
            return updatedSettings;
        }
    }

    async getPayment(paymentId) {
        try {
            if (db) {
                const doc = await db.collection('payments').doc(paymentId).get();
                return doc.exists ? doc.data() : null;
            }
            return paymentDatabase.get(paymentId) || null;
        } catch (error) {
            console.error('DB Error getPayment:', error.message);
            return paymentDatabase.get(paymentId) || null;
        }
    }

    async getAllPayments() {
        try {
            if (db) {
                const snapshot = await db.collection('payments').get();
                return snapshot.docs.map(doc => doc.data());
            }
            return Array.from(paymentDatabase.values());
        } catch (error) {
            console.error('DB Error getAllPayments:', error.message);
            return Array.from(paymentDatabase.values());
        }
    }
    
    async setMaintenanceMode(enabled) {
        this.maintenanceMode = enabled; // Set local state immediately
        try {
            const settings = await this.getSettings();
            settings.maintenance_mode = enabled;
            await this.updateSettings(settings);
            return true;
        } catch (error) {
            console.error('DB Error setMaintenanceMode:', error.message);
            return true; // Assume success for local mode
        }
    }

    isMaintenanceMode() {
        return this.maintenanceMode;
    }

    async searchUsers(query) {
        try {
            const users = await this.getAllUsers();
            const lowerQuery = query.toLowerCase();
            return users.filter(user => 
                (user.user_id && user.user_id.toString().includes(query)) ||
                (user.username && user.username.toLowerCase().includes(lowerQuery)) ||
                (user.onexbet && user.onexbet.includes(query))
            );
        } catch (error) {
            console.error('Search users error:', error);
            return [];
        }
    }
}

// INITIALIZE SYSTEMS
const goalAI = new GoalPredictionAI();
const dbManager = new DatabaseManager();
const fakeStats = new FakeStatistics();
const imgbbUploader = new ImgBBUploader(CONFIG.IMGBB_API_KEY);
// Load maintenance mode on start
dbManager.getSettings().then(s => { dbManager.maintenanceMode = s.maintenance_mode; });

// 🎯 BOT SETUP
bot.use(session({ defaultSession: () => ({ step: 'start' }) }));

// KEYBOARDS
const getMainKeyboard = () => Markup.keyboard([['🎯 التوقع التالي', '📊 إحصائياتي'], ['📸 إرسال صورة', '💳 الاشتراكات'], ['👥 إحصائيات البوت', '👤 حالة الاشتراك'], ['🆘 الدعم الفني']]).resize();
const getLoginKeyboard = () => Markup.keyboard([['🔐 إدخال رقم الحساب']]).resize();
const getSubscriptionKeyboard = () => Markup.keyboard([['💰 أسبوعي', '💰 شهري'], ['💰 3 أشهر', '💰 سنوي'], ['🔙 الرجوع للقائمة']]).resize();
const getAdminMainKeyboard = () => Markup.keyboard([['📊 إحصائيات النظام', '👥 إدارة المستخدمين'], ['💰 طلبات الدفع', '⚙️ الإعدادات'], ['📢 إرسال إشعار', '🔍 بحث عن مستخدم'], ['🔧 قفل/فتح البوت', '🔙 الخروج من الإدمن']]).resize();
const getAdminUsersKeyboard = () => Markup.keyboard([['📋 قائمة المستخدمين', '✅ المشتركين النشطين'], ['🆓 المستخدمين المجانين', '📈 إحصائيات المستخدمين'], ['🔙 رجوع']]).resize();
const getAdminPaymentsKeyboard = () => Markup.keyboard([['📥 الطلبات المعلقة', '✅ الطلبات المقبولة'], ['❌ الطلبات المرفوضة', '📋 كل الطلبات'], ['🔙 رجوع']]).resize();
const getAdminSettingsKeyboard = () => Markup.keyboard([['💰 تعديل الأسعار', '🔗 تعديل روابط الدفع'], ['🔙 رجوع']]).resize();


// 🛠️ UTILITY FUNCTIONS
function calculateRemainingDays(endDate) {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function addSubscriptionDays(startDate, type) {
    const start = new Date(startDate);
    const daysToAdd = { week: 7, month: 30, three_months: 90, year: 365 }[type] || 0;
    start.setDate(start.getDate() + daysToAdd);
    return start.toISOString();
}

// 🎯 BOT COMMANDS
bot.start(async (ctx) => {
    try {
        const settings = await dbManager.getSettings();
        if (settings.maintenance_mode && ctx.from.id.toString() !== CONFIG.ADMIN_ID) {
            return ctx.replyWithMarkdown('🔧 *البوت تحت الصيانة*\n\nنعمل حالياً على تحسينات. سنعود قريباً!');
        }

        const userId = ctx.from.id.toString();
        const userName = ctx.from.first_name;

        try {
            await ctx.replyWithPhoto(CONFIG.START_IMAGE, {
                caption: `🎉 *مرحباً بك في نظام GOAL Predictor Pro v${CONFIG.VERSION}* 🚀\n\n` +
                         `🤖 *أقوى نظام لتوقع الأهداف بالذكاء الاصطناعي*\n` +
                         `💎 *المطور:* ${CONFIG.DEVELOPER}\n` +
                         `📢 *القناة:* ${CONFIG.CHANNEL}`
            });
        } catch (photoError) {
            console.error("Failed to send start photo:", photoError.message);
            await ctx.replyWithMarkdown(`🎉 *مرحباً بك في نظام GOAL Predictor Pro v${CONFIG.VERSION}* 🚀`);
        }

        const existingUser = await dbManager.getUser(userId);
        
        if (existingUser && existingUser.onexbet) {
            ctx.session.step = 'verified';
            ctx.session.userData = existingUser;
            const remainingDays = calculateRemainingDays(existingUser.subscription_end_date);
            let statusMessage = (existingUser.subscription_status === 'active' && remainingDays > 0)
                ? `✅ *اشتراكك نشط*\n\n🔐 الحساب: \`${existingUser.onexbet}\`\n📅 الانتهاء: بعد ${remainingDays} يوم`
                : (existingUser.free_attempts > 0)
                ? `🎯 *لديك ${existingUser.free_attempts} محاولات مجانية متبقية*\n\n🔐 الحساب: \`${existingUser.onexbet}\``
                : `🚫 *انتهت محاولاتك المجانية*\n\n🔐 الحساب: \`${existingUser.onexbet}\`\n💳 يرجى الاشتراك للمتابعة.`;
            await ctx.replyWithMarkdown(statusMessage, getMainKeyboard());
        } else {
            ctx.session.step = 'start';
            const welcomeMessage = `🔐 *مرحباً ${userName}*\n\n` +
                                   `🎯 نظام توقع الأهداف الذكي\n` +
                                   `1️⃣ أدخل رقم حساب 1xBet (10 أرقام)\n` +
                                   `2️⃣ استلم كود تحقق وهمي (للتأكيد)\n` +
                                   `3️⃣ ابدأ بمحاولاتك المجانية!\n\n` +
                                   `*اضغط على "🔐 إدخال رقم الحساب" للبدء*`;
            await ctx.replyWithMarkdown(welcomeMessage, getLoginKeyboard());
        }
    } catch (error) {
        console.error('Start command error:', error);
        await ctx.replyWithMarkdown('❌ حدث خطأ في النظام، يرجى المحاولة لاحقاً');
    }
});

// 📝 HANDLE TEXT MESSAGES
bot.on('text', async (ctx) => {
    try {
        const settings = await dbManager.getSettings();
        if (settings.maintenance_mode && ctx.from.id.toString() !== CONFIG.ADMIN_ID) {
            return; // Don't respond during maintenance
        }

        const text = ctx.message.text;
        const session = ctx.session;
        const userId = ctx.from.id.toString();

        // Admin mode handling
        if (userId === CONFIG.ADMIN_ID && (text === '/admin' || text === '🔐 لوحة التحكم')) {
            session.adminMode = true;
            session.adminStep = 'main';
            return ctx.replyWithMarkdown('🔧 *مرحباً في لوحة التحكم*', getAdminMainKeyboard());
        }
        if (session.adminMode) {
            return handleAdminCommands(ctx, text);
        }
        
        // Main user flow
        if (session.step === 'awaiting_account_id') {
            if (/^\d{10}$/.test(text)) {
                session.accountId = text;
                session.step = 'awaiting_verification';
                session.verificationCode = Math.floor(100000 + Math.random() * 900000);
                return ctx.replyWithMarkdown(`✅ *تم إرسال كود التحقق (وهمي)*\n\n🔐 *الحساب:* \`${text}\`\n📧 *الكود:* \`${session.verificationCode}\`\n\n🔢 *أرسل الكود للتأكيد*`);
            } else {
                return ctx.replyWithMarkdown('❌ *رقم حساب غير صحيح!*\n\nيرجى إرسال 10 أرقام.');
            }
        } else if (session.step === 'awaiting_verification') {
            if (parseInt(text) === session.verificationCode) {
                const userData = { user_id: userId, username: ctx.from.first_name, onexbet: session.accountId, free_attempts: 2, subscription_status: 'free', joined_at: new Date().toISOString() };
                await dbManager.saveUser(userId, userData);
                session.step = 'verified';
                session.userData = userData;
                return ctx.replyWithMarkdown(`🎉 *تم التحقق بنجاح!*\n\n🎁 *لديك محاولتان مجانيتان.*\n\n📸 *يمكنك الآن إرسال صورة المباراة للتحليل.*`, getMainKeyboard());
            } else {
                return ctx.replyWithMarkdown('❌ *كود تحقق خاطئ!*');
            }
        } else if (session.awaitingPaymentAccount) {
             if (/^\d{10}$/.test(text)) {
                session.awaitingPaymentAccount = false;
                session.paymentAccount = text;
                return ctx.replyWithMarkdown(`✅ *تم حفظ رقم الحساب:* \`${text}\`\n\n📸 *الآن يرجى إرسال صورة إثبات الدفع*`);
            } else {
                return ctx.replyWithMarkdown('❌ *رقم حساب غير صحيح!*\n\n🔢 يرجى إرسال رقم حساب 1xBet مكون من 10 أرقام');
            }
        }

        const userData = await dbManager.getUser(userId);
        if (!userData || !userData.onexbet) {
             return bot.start(ctx);
        }
        
        // Keyboard handlers
        switch (text) {
            case '🔐 إدخال رقم الحساب':
                session.step = 'awaiting_account_id';
                return ctx.replyWithMarkdown('🔢 *أرسل رقم حساب 1xBet الخاص بك (10 أرقام)*');
            case '🎯 التوقع التالي':
                if (session.lastImageUrl) {
                    return handleNextPrediction(ctx, userData);
                }
                session.awaitingBetAmount = true;
                return ctx.replyWithMarkdown('💰 *أدخل مبلغ الرهان:*\n\n💵 مثال: 10 أو 25.5');
            case '📊 إحصائياتي': return handleUserStats(ctx, userData);
            case '👥 إحصائيات البوت': return handleBotStats(ctx);
            case '📸 إرسال صورة': return ctx.replyWithMarkdown('📸 *يرجى إرسال صورة المباراة للتحليل*');
            case '💳 الاشتراكات': return handleSubscriptions(ctx);
            case '👤 حالة الاشتراك': return handleSubscriptionStatus(ctx, userData);
            case '🆘 الدعم الفني': return ctx.replyWithMarkdown(`🆘 *للدعم الفني*\n\n👤 تواصل مع: ${CONFIG.DEVELOPER}\n📢 القناة: ${CONFIG.CHANNEL}`);
            case '🔙 الرجوع للقائمة': return ctx.replyWithMarkdown('🔙 *العودة للقائمة الرئيسية*', getMainKeyboard());
            default:
                if (text.startsWith('💰 ')) return handleSubscriptionSelection(ctx, text);
                if (session.awaitingBetAmount) {
                    const betAmount = parseFloat(text);
                    if (isNaN(betAmount) || betAmount <= 0) {
                        return ctx.replyWithMarkdown('❌ *مبلغ غير صحيح!* أدخل مبلغ صحيح للرهان.');
                    }
                    session.currentBet = betAmount;
                    session.awaitingBetAmount = false;
                    return ctx.replyWithMarkdown(`✅ *تم تحديد مبلغ الرهان:* ${betAmount}$\n\n📸 *الآن أرسل صورة المباراة للتحليل*`, getMainKeyboard());
                }
                break;
        }
    } catch (error) {
        console.error('Text handler error:', error);
        await ctx.replyWithMarkdown('❌ حدث خطأ غير متوقع', getMainKeyboard());
    }
});

// 🖼️ IMAGE ANALYSIS HANDLER
bot.on('photo', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const session = ctx.session;

        if (session.paymentType) return handlePaymentScreenshot(ctx, userId);

        const userData = await dbManager.getUser(userId);
        if (!userData || !userData.onexbet) return ctx.replyWithMarkdown('❌ *يجب التحقق من الحساب أولاً* عبر /start', getLoginKeyboard());
        if (userData.subscription_status !== 'active' && userData.free_attempts <= 0) return ctx.replyWithMarkdown('🚫 *انتهت المحاولات المجانية*، يرجى الاشتراك.', getMainKeyboard());
        if (!session.currentBet || session.currentBet <= 0) return ctx.replyWithMarkdown('❌ *يجب تحديد مبلغ الرهان أولاً* باستخدام زر "🎯 التوقع التالي".', getMainKeyboard());

        const photo = ctx.message.photo.pop();
        const fileLink = await bot.telegram.getFileLink(photo.file_id);
        session.lastImageUrl = fileLink.href;

        const processingMsg = await ctx.reply('🔄 جاري التحقق من الصورة وتحليلها بالذكاء الاصطناعي...');

        try {
            // Main analysis call which includes validation
            const prediction = await goalAI.analyzeImage(session.lastImageUrl);

            if (userData.subscription_status !== 'active') userData.free_attempts--;
            userData.total_predictions = (userData.total_predictions || 0) + 1;
            userData.total_bets = (userData.total_bets || 0) + session.currentBet;
            await dbManager.saveUser(userId, userData);

            const analysisMessage = `🤖 *تحليل الذكاء الاصطناعي v${CONFIG.VERSION}*\n\n` +
                                    `🔐 الحساب: \`${userData.onexbet}\`\n` +
                                    `💰 الرهان: ${session.currentBet}$\n\n` +
                                    `🎯 *النتيجة:* ${prediction.type}\n` +
                                    `📈 *الاحتمالية:* ${prediction.probability}%\n` +
                                    `💡 *التحليل:* ${prediction.reasoning}\n\n` +
                                    `${userData.subscription_status !== 'active' ? `🆓 *المحاولات المتبقية:* ${userData.free_attempts}` : '✅ *اشتراك نشط*'}`;
            
            await ctx.replyWithMarkdown(analysisMessage);
            const resultKeyboard = Markup.inlineKeyboard([[
                Markup.button.callback(`🎊 ربحت ${session.currentBet * 2}$`, `win_${Date.now()}`),
                Markup.button.callback(`🔄 خسرت`, `lose_${Date.now()}`)
            ]]);
            await ctx.replyWithMarkdown('📊 *ما هي نتيجة التوقع؟*', resultKeyboard);
            await ctx.deleteMessage(processingMsg.message_id);

        } catch (analysisError) {
            await ctx.deleteMessage(processingMsg.message_id);
            if (analysisError.message === 'INVALID_IMAGE') {
                return ctx.replyWithMarkdown('❌ *صورة غير صالحة!*\n\n☝️ يرجى إرسال صورة المباراة الصحيحة التي تحتوي على (اللاعبين، زر الهدف، كلمة GOAL، وزر الرهان).');
            }
            console.error('Analysis error:', analysisError);
            // Fallback for other errors
            return ctx.replyWithMarkdown('❌ حدث خطأ أثناء التحليل، يرجى المحاولة مرة أخرى.');
        }

    } catch (error) {
        console.error('Photo handler error:', error);
        await ctx.replyWithMarkdown('❌ *حدث خطأ في معالجة الصورة*', getMainKeyboard());
    }
});


// 🎯 HANDLE CALLBACK QUERIES
bot.on('callback_query', async (ctx) => {
    try {
        const [action, data] = ctx.callbackQuery.data.split('_');
        const userId = ctx.from.id.toString();

        if (['win', 'lose'].includes(action)) {
            const userData = await dbManager.getUser(userId);
            if (!userData) return ctx.answerCbQuery('❌ لم يتم العثور على بيانات المستخدم');

            const isWin = action === 'win';
            if (isWin) {
                const profit = ctx.session.currentBet;
                userData.wins = (userData.wins || 0) + 1;
                userData.total_profit = (userData.total_profit || 0) + profit;
                await ctx.answerCbQuery(`🎊 مبروك! ربحت ${profit}$`);
                await ctx.replyWithMarkdown(`🎊 *مبروك! ربحت ${profit}$*\n\n🎯 يمكنك البدء بتوقع جديد.`);
            } else {
                userData.losses = (userData.losses || 0) + 1;
                ctx.session.currentBet *= 2; // Double the bet
                await ctx.answerCbQuery(`🔄 خسرت! الرهان التالي: ${ctx.session.currentBet}$`);
                await ctx.replyWithMarkdown(`🔄 *خسرت هذه الجولة.*\n\n📈 الرهان التالي مضاعف إلى: *${ctx.session.currentBet}$*\n💪 استمر في المحاولة! استخدم "🎯 التوقع التالي".`);
            }
            await dbManager.saveUser(userId, userData);
            try { await ctx.deleteMessage(); } catch (e) {}
        } else if (action === 'accept' || action === 'reject') {
            if (userId !== CONFIG.ADMIN_ID) return ctx.answerCbQuery('❌ غير مصرح لك.');
            if (action === 'accept') await handlePaymentAccept(ctx, data);
            if (action === 'reject') await handlePaymentReject(ctx, data);
        }
    } catch (error) {
        console.error('Callback query error:', error);
        await ctx.answerCbQuery('❌ حدث خطأ في المعالجة');
    }
});


// 🎯 HANDLER FUNCTIONS
async function handleNextPrediction(ctx, userData) {
    if (!ctx.session.lastImageUrl) return ctx.replyWithMarkdown('❌ *لا توجد صورة سابقة*. يرجى إرسال صورة أولاً.');
    
    // Check for attempts/subscription again
    if (userData.subscription_status !== 'active' && userData.free_attempts <= 0) return ctx.replyWithMarkdown('🚫 *انتهت المحاولات المجانية*، يرجى الاشتراك.');
    if (!ctx.session.currentBet) ctx.session.currentBet = 1; // Default bet if not set

    const processingMsg = await ctx.reply('🔄 جاري إنشاء التوقع التالي...');
    
    try {
        const prediction = goalAI.generateNextPrediction(userId); // Use simpler prediction for "next"
        
        if (userData.subscription_status !== 'active') userData.free_attempts--;
        userData.total_predictions = (userData.total_predictions || 0) + 1;
        userData.total_bets = (userData.total_bets || 0) + ctx.session.currentBet;
        await dbManager.saveUser(ctx.from.id.toString(), userData);

        const analysisMessage = `🤖 *التوقع التالي*\n\n` +
                                `💰 الرهان الحالي: ${ctx.session.currentBet}$\n\n` +
                                `🎯 *النتيجة:* ${prediction.type}\n` +
                                `📈 *الاحتمالية:* ${prediction.probability}%`;

        await ctx.replyWithMarkdown(analysisMessage);
        const resultKeyboard = Markup.inlineKeyboard([[
            Markup.button.callback(`🎊 ربحت ${ctx.session.currentBet * 2}$`, `win_${Date.now()}`),
            Markup.button.callback(`🔄 خسرت`, `lose_${Date.now()}`)
        ]]);
        await ctx.replyWithMarkdown('📊 *ما هي نتيجة التوقع؟*', resultKeyboard);
        await ctx.deleteMessage(processingMsg.message_id);
    } catch (error) {
        console.error('Next prediction error:', error);
        await ctx.deleteMessage(processingMsg.message_id);
        await ctx.replyWithMarkdown('❌ *حدث خطأ في إنشاء التوقع التالي*');
    }
}

async function handleUserStats(ctx, userData) {
    const accuracy = userData.total_predictions > 0 ? Math.round(((userData.wins || 0) / userData.total_predictions) * 100) : 0;
    let subInfo = `\n🆓 *محاولات مجانية:* ${userData.free_attempts}`;
    if (userData.subscription_status === 'active') {
        const remaining = calculateRemainingDays(userData.subscription_end_date);
        subInfo = `\n📦 *الاشتراك:* ${userData.subscription_type}\n⏳ *متبقي:* ${remaining} يوم`;
    }
    await ctx.replyWithMarkdown(`📊 *إحصائياتك*\n\n` +
                                `🔐 ${userData.onexbet}\n` +
                                `📈 ${userData.total_predictions || 0} توقع\n` +
                                `🎯 ${accuracy}% دقة\n` +
                                `🎉 ${userData.wins || 0} فوز | 💔 ${userData.losses || 0} خسارة\n` +
                                `💵 إجمالي الأرباح: ${userData.total_profit || 0}$` +
                                subInfo);
}

async function handleBotStats(ctx) {
    const stats = fakeStats.getStats();
    await ctx.replyWithMarkdown(`👥 *إحصائيات البوت*\n\n` +
                                `👤 إجمالي المستخدمين: ${stats.totalUsers.toLocaleString()}\n` +
                                `🟢 نشطين الآن: ${stats.activeUsers}`);
}

async function handleSubscriptions(ctx) {
    const settings = await dbManager.getSettings();
    const prices = settings.prices;
    await ctx.replyWithMarkdown(`💳 *باقات الاشتراك*\n\n`+
                                `💰 *أسبوعي:* ${prices.week}$\n` +
                                `💰 *شهري:* ${prices.month}$\n` +
                                `💰 *3 أشهر:* ${prices.three_months}$\n` +
                                `💰 *سنوي:* ${prices.year}$\n\n` +
                                `*اختر الباقة للدفع*`, getSubscriptionKeyboard());
}

async function handleSubscriptionSelection(ctx, text) {
    const typeMap = { '💰 أسبوعي': 'week', '💰 شهري': 'month', '💰 3 أشهر': 'three_months', '💰 سنوي': 'year' };
    const type = typeMap[text];
    if (!type) return;

    const settings = await dbManager.getSettings();
    ctx.session.paymentType = type;
    ctx.session.awaitingPaymentAccount = true;

    await ctx.replyWithMarkdown(`💳 *باقة ${text.replace('💰 ', '')}*\n\n` +
                                `💰 السعر: ${settings.prices[type]}$\n` +
                                `🔗 رابط الدفع: ${settings.payment_links[type]}\n\n` +
                                `📋 *بعد الدفع، أرسل رقم حساب 1xBet (10 أرقام) ثم صورة الإثبات.*`);
}

async function handleSubscriptionStatus(ctx, userData) {
    let statusMessage = (userData.subscription_status === 'active')
        ? `✅ *اشتراكك نشط*\n\n📦 النوع: ${userData.subscription_type}\n📅 الانتهاء: بعد ${calculateRemainingDays(userData.subscription_end_date)} يوم`
        : (userData.free_attempts > 0)
        ? `🎯 *لديك ${userData.free_attempts} محاولات مجانية متبقية*`
        : `🚫 *انتهت محاولاتك المجانية*، يرجى الاشتراك.`;
    await ctx.replyWithMarkdown(statusMessage);
}

async function handlePaymentScreenshot(ctx, userId) {
    try {
        const photo = ctx.message.photo.pop();
        const fileLink = await bot.telegram.getFileLink(photo.file_id);
        const uploadResult = await imgbbUploader.uploadImage(fileLink.href);

        const settings = await dbManager.getSettings();
        const paymentData = {
            user_id: userId,
            onexbet: ctx.session.paymentAccount,
            screenshot_url: uploadResult.url,
            amount: settings.prices[ctx.session.paymentType],
            subscription_type: ctx.session.paymentType,
            username: ctx.from.first_name,
        };

        const paymentId = await dbManager.addPayment(paymentData);
        
        await bot.telegram.sendMessage(CONFIG.ADMIN_ID,
            `🆕 *طلب دفع جديد (#${paymentId})*\n\n` +
            `👤 المستخدم: ${paymentData.username} (${userId})\n` +
            `🔐 الحساب: ${paymentData.onexbet}\n` +
            `💰 المبلغ: ${paymentData.amount}$ (${paymentData.subscription_type})\n` +
            `🔗 [صورة الإثبات](${uploadResult.url})`, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[
                    { text: '✅ قبول', callback_data: `accept_${paymentId}` },
                    { text: '❌ رفض', callback_data: `reject_${paymentId}` }
                ]]}
            }
        );

        await ctx.replyWithMarkdown('📩 *تم استلام طلبك بنجاح*\n\nسيتم مراجعته وتفعيل الاشتراك قريباً.', getMainKeyboard());
        ctx.session.paymentType = null;
        ctx.session.awaitingPaymentAccount = false;
        ctx.session.paymentAccount = null;
    } catch (error) {
        console.error('Payment screenshot error:', error);
        await ctx.replyWithMarkdown('❌ *حدث خطأ في معالجة صورة الدفع*');
    }
}

// 🔧 ADMIN HANDLERS
async function handleAdminCommands(ctx, text) {
    const session = ctx.session;

    if (session.adminStep === 'price_edit') return handleAdminPriceEdit(ctx, text);
    if (session.adminStep === 'link_edit') return handleAdminLinkEdit(ctx, text);
    if (session.adminStep === 'broadcast_confirm') {
         if (text === 'نعم، إرسال') {
            await handleAdminBroadcast(ctx, session.broadcastMessage);
         } else {
            session.adminStep = 'main';
            session.broadcastMessage = null;
            return ctx.replyWithMarkdown('📢 تم إلغاء الإرسال.', getAdminMainKeyboard());
         }
         return;
    }
     if (session.adminStep === 'broadcast') {
         session.broadcastMessage = text;
         session.adminStep = 'broadcast_confirm';
         return ctx.replyWithMarkdown(`📢 *هل أنت متأكد من إرسال هذه الرسالة؟*\n\n---\n${text}\n---\n\n*أرسل "نعم، إرسال" للتأكيد أو أي شيء آخر للإلغاء.*`, Markup.keyboard(['نعم، إرسال', 'إلغاء']).resize().oneTime());
    }
    if (session.adminStep === 'search_user') return handleAdminSearchUser(ctx, text);

    switch(text) {
        case '📊 إحصائيات النظام': return handleAdminStats(ctx);
        case '👥 إدارة المستخدمين': session.adminStep = 'users'; return ctx.replyWithMarkdown('👥 *إدارة المستخدمين*', getAdminUsersKeyboard());
        case '💰 طلبات الدفع': session.adminStep = 'payments'; return ctx.replyWithMarkdown('💰 *إدارة طلبات الدفع*', getAdminPaymentsKeyboard());
        case '⚙️ الإعدادات': session.adminStep = 'settings'; return ctx.replyWithMarkdown('⚙️ *الإعدادات*', getAdminSettingsKeyboard());
        case '📢 إرسال إشعار': session.adminStep = 'broadcast'; return ctx.replyWithMarkdown('📢 *أكتب الرسالة التي تريد إرسالها للجميع:*');
        case '🔍 بحث عن مستخدم': session.adminStep = 'search_user'; return ctx.replyWithMarkdown('🔍 *أدخل رقم الحساب، اسم المستخدم، أو آيدي التليجرام:*');
        case '🔧 قفل/فتح البوت': return handleAdminToggleMaintenance(ctx);
        case '🔙 الخروج من الإدمن': session.adminMode = false; session.adminStep = null; return ctx.replyWithMarkdown('🔒 *تم الخروج من وضع الإدمن*', getMainKeyboard());
        case '🔙 رجوع': session.adminStep = 'main'; return ctx.replyWithMarkdown('🔙 *العودة للقائمة الرئيسية*', getAdminMainKeyboard());
        default:
             if (session.adminStep === 'users') return handleAdminUsers(ctx, text);
             if (session.adminStep === 'payments') return handleAdminPayments(ctx, text);
             if (session.adminStep === 'settings') return handleAdminSettings(ctx, text);
            break;
    }
}

async function handleAdminBroadcast(ctx, message) {
    session = ctx.session;
    session.adminStep = 'main';
    session.broadcastMessage = null;
    try {
        const users = await dbManager.getAllUsers();
        let success = 0, failed = 0;
        await ctx.replyWithMarkdown(`📢 *بدء إرسال الإشعار لـ ${users.length} مستخدم...*`);

        for (const user of users) {
            try {
                await bot.telegram.sendMessage(user.user_id, `📢 *إشعار من الإدارة*\n\n${message}`, { parse_mode: 'Markdown' });
                success++;
            } catch (e) {
                failed++;
            }
            await new Promise(res => setTimeout(res, 100)); // Rate limit avoidance
        }
        return ctx.replyWithMarkdown(`📢 *اكتمل الإرسال*\n\n✅ نجح: ${success}\n❌ فشل: ${failed}`, getAdminMainKeyboard());
    } catch (error) {
        console.error('Admin broadcast error:', error);
        return ctx.replyWithMarkdown('❌ حدث خطأ فادح أثناء الإرسال.', getAdminMainKeyboard());
    }
}

async function handleAdminSearchUser(ctx, query) {
     ctx.session.adminStep = 'main';
    const users = await dbManager.searchUsers(query);
    if (!users.length) return ctx.replyWithMarkdown('❌ *لم يتم العثور على مستخدمين.*', getAdminMainKeyboard());
    
    let message = `🔍 *نتائج البحث (${users.length})*\n\n`;
    users.slice(0, 10).forEach(u => {
        message += `👤 *${u.username}* (${u.subscription_status})\n` +
                   `   ID: \`${u.user_id}\`\n` +
                   `   1xBet: \`${u.onexbet}\`\n` +
                   `    predictions: ${u.total_predictions || 0}\n\n`;
    });
    return ctx.replyWithMarkdown(message, getAdminMainKeyboard());
}

async function handleAdminToggleMaintenance(ctx) {
    const newStatus = !dbManager.isMaintenanceMode();
    await dbManager.setMaintenanceMode(newStatus);
    return ctx.replyWithMarkdown(newStatus ? '🔒 *تم قفل البوت للصيانة.*' : '🔓 *تم فتح البوت.*', getAdminMainKeyboard());
}

async function handleAdminStats(ctx) {
     const users = await dbManager.getAllUsers();
     const payments = await dbManager.getAllPayments();
     const active = users.filter(u => u.subscription_status === 'active').length;
     const pending = payments.filter(p => p.status === 'pending').length;
     const totalProfit = payments.filter(p=>p.status === 'accepted').reduce((sum, p) => sum + p.amount, 0);

    return ctx.replyWithMarkdown(`📊 *إحصائيات النظام*\n\n`+
                                 `👥 إجمالي المستخدمين: ${users.length}\n`+
                                 `✅ المشتركين النشطين: ${active}\n`+
                                 `📥 طلبات الدفع المعلقة: ${pending}\n`+
                                 `💰 إجمالي الأرباح: ${totalProfit}$`);
}

async function handleAdminUsers(ctx, text) {
     const users = await dbManager.getAllUsers();
     let message = '';
     let filteredUsers = [];
     switch(text) {
        case '📋 قائمة المستخدمين':
            message = `📋 *كل المستخدمين (${users.length})*:\n\n`;
            filteredUsers = users;
            break;
        case '✅ المشتركين النشطين':
            filteredUsers = users.filter(u => u.subscription_status === 'active');
            message = `✅ *المشتركين النشطين (${filteredUsers.length})*:\n\n`;
            break;
        case '🆓 المستخدمين المجانين':
            filteredUsers = users.filter(u => u.subscription_status !== 'active');
            message = `🆓 *المستخدمين المجانين (${filteredUsers.length})*:\n\n`;
            break;
        case '📈 إحصائيات المستخدمين':
             const activeCount = users.filter(u => u.subscription_status === 'active').length;
             const totalPredictions = users.reduce((sum, u) => sum + (u.total_predictions || 0), 0);
             message = `📈 *إحصائيات المستخدمين*\n\n👥 الإجمالي: ${users.length}\n✅ نشطين: ${activeCount}\n📊 إجمالي التوقعات: ${totalPredictions}`;
            return ctx.replyWithMarkdown(message);
        default: return;
     }
     filteredUsers.slice(0,15).forEach(u => {
         message += `👤 ${u.username} | \`${u.user_id}\` | ${u.onexbet}\n`;
     });
     return ctx.replyWithMarkdown(message);
}

async function handleAdminPayments(ctx, text) {
    const payments = await dbManager.getAllPayments();
    if (text === '📥 الطلبات المعلقة') {
        const pending = payments.filter(p => p.status === 'pending');
        if (!pending.length) return ctx.replyWithMarkdown('✅ *لا توجد طلبات دفع معلقة.*');
        for (const p of pending) {
            await ctx.replyWithMarkdown(
                `📥 *طلب #${p.id}*\n` +
                `👤 ${p.username} (\`${p.user_id}\`)\n` +
                `🔐 ${p.onexbet}\n💰 ${p.amount}$ (${p.subscription_type})\n` +
                `[صورة](${p.screenshot_url})`, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: [[{ text: '✅ قبول', callback_data: `accept_${p.id}` }, { text: '❌ رفض', callback_data: `reject_${p.id}` }]] }
                }
            );
        }
    }
    // Implement other payment list views if needed (accepted, rejected, all)
}

async function handleAdminSettings(ctx, text) {
    if (text === '💰 تعديل الأسعار') {
        const settings = await dbManager.getSettings();
        ctx.session.adminStep = 'price_edit';
        return ctx.replyWithMarkdown(`💰 *الأسعار الحالية:*\n`+
            `week: ${settings.prices.week}, month: ${settings.prices.month}\n`+
            `three_months: ${settings.prices.three_months}, year: ${settings.prices.year}\n\n`+
            `*للتعديل أرسل:*\n\`type new_price\` (مثال: \`week 15\`)`);
    }
    if (text === '🔗 تعديل روابط الدفع') {
        const settings = await dbManager.getSettings();
        ctx.session.adminStep = 'link_edit';
        return ctx.replyWithMarkdown(`🔗 *روابط الدفع الحالية:*\n`+
            `week: ${settings.payment_links.week}\n`+
            `month: ${settings.payment_links.month}\n\n`+
            `*للتعديل أرسل:*\n\`type new_link\` (مثال: \`month https://new.link\`)`);
    }
}

async function handleAdminPriceEdit(ctx, text) {
    const [type, priceStr] = text.split(' ');
    const price = parseFloat(priceStr);
    if (!['week', 'month', 'three_months', 'year'].includes(type) || isNaN(price) || price <= 0) {
        return ctx.replyWithMarkdown('❌ *صيغة غير صحيحة*. مثال: `week 15`');
    }
    const settings = await dbManager.getSettings();
    settings.prices[type] = price;
    await dbManager.updateSettings({prices: settings.prices});
    ctx.session.adminStep = 'settings';
    return ctx.replyWithMarkdown(`✅ *تم تحديث السعر بنجاح*: ${type} is now ${price}$`, getAdminSettingsKeyboard());
}

async function handleAdminLinkEdit(ctx, text) {
    const [type, link] = text.split(' ');
    if (!['week', 'month', 'three_months', 'year'].includes(type) || !link || !link.startsWith('http')) {
        return ctx.replyWithMarkdown('❌ *صيغة غير صحيحة*. مثال: `month https://link.com`');
    }
    const settings = await dbManager.getSettings();
    settings.payment_links[type] = link;
    await dbManager.updateSettings({payment_links: settings.payment_links});
    ctx.session.adminStep = 'settings';
    return ctx.replyWithMarkdown(`✅ *تم تحديث الرابط بنجاح.*`, getAdminSettingsKeyboard());
}


async function handlePaymentAccept(ctx, paymentId) {
    const payment = await dbManager.getPayment(paymentId);
    if (!payment || payment.status !== 'pending') return ctx.answerCbQuery('❌ الطلب تمت معالجته أو غير موجود');
    
    const userData = await dbManager.getUser(payment.user_id);
    if (!userData) return ctx.answerCbQuery('❌ المستخدم غير موجود');
    
    const startDate = new Date().toISOString();
    const endDate = addSubscriptionDays(startDate, payment.subscription_type);
    
    userData.subscription_status = 'active';
    userData.subscription_type = payment.subscription_type;
    userData.subscription_start_date = startDate;
    userData.subscription_end_date = endDate;
    
    await dbManager.saveUser(payment.user_id, userData);
    await dbManager.updatePayment(paymentId, { status: 'accepted' });
    
    await bot.telegram.sendMessage(payment.user_id, `🎉 *تم تفعيل اشتراكك (${payment.subscription_type}) بنجاح!*`);
    await ctx.answerCbQuery('✅ تم تفعيل الاشتراك');
    await ctx.editMessageText(`✅ *تم قبول الطلب #${paymentId}*`);
}

async function handlePaymentReject(ctx, paymentId) {
    const payment = await dbManager.getPayment(paymentId);
    if (!payment || payment.status !== 'pending') return ctx.answerCbQuery('❌ الطلب تمت معالجته أو غير موجود');

    await dbManager.updatePayment(paymentId, { status: 'rejected' });
    
    await bot.telegram.sendMessage(payment.user_id, `❌ *تم رفض طلب الدفع الخاص بك.* يرجى التواصل مع الدعم الفني.`);
    await ctx.answerCbQuery('❌ تم رفض الطلب');
    await ctx.editMessageText(`❌ *تم رفض الطلب #${paymentId}*`);
}


// 🚀 START BOT
bot.launch().then(() => {
    console.log(`🎉 SUCCESS! AI GOAL Predictor v${CONFIG.VERSION} is RUNNING!`);
    console.log(`👤 Developer: ${CONFIG.DEVELOPER}`);
    console.log(`📢 Channel: ${CONFIG.CHANNEL}`);
}).catch(err => {
    console.error("BOT LAUNCH FAILED:", err);
});

// ⚡ Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ AI Goal Prediction System Ready!');
