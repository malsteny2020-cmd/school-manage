import { GOOGLE_SHEET_URL, GOOGLE_SCRIPT_URL } from '../config';
import type { Student, Teacher, Subject, Grade, Announcement, AppData, Attendance } from '../types';

// دالة مساعدة لتحليل نص CSV وتحويله إلى مصفوفة من الكائنات
const parseCSV = <T>(csvText: string): T[] => {
    const lines = csvText.trim().replace(/\r/g, '').split('\n');
    if (lines.length < 2) return [];
    
    // تقوم Google gviz API بتغليف العناوين بعلامات اقتباس، لذلك نزيلها
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
        // ملاحظة: هذا التقسيم البسيط قد يفشل إذا كانت الحقول تحتوي على فاصلة
        // لكن بالنسبة لمخرجات gviz، عادة ما تكون آمنة.
        const values = line.split(',');
        const entry = {} as T;
        headers.forEach((header, index) => {
            if (!header) return;
            const key = header as keyof T;

            // تنظيف القيمة: إزالة المسافات وعلامات الاقتباس المحيطة
            const rawValue = values[index] || '';
            const value = rawValue.trim().replace(/^"|"$/g, '');
            
            // تحويل أنواع البيانات بناءً على اسم الحقل
            if (['id', 'grade', 'teacherId', 'studentId'].includes(header)) {
                (entry[key] as any) = value ? parseInt(value, 10) : null;
            } else if (header === 'score') {
                 (entry[key] as any) = value ? parseFloat(value) : null;
            } else {
                entry[key] = value as any;
            }
        });
        return entry;
    });
};

// جلب البيانات لتبويب معين
const fetchSheetData = async <T>(sheetName: string): Promise<T[]> => {
    if (GOOGLE_SHEET_URL === 'YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE') {
        throw new Error("يرجى تحديث رابط Google Sheet في ملف config.ts");
    }

    if (GOOGLE_SHEET_URL.includes('/d/e/')) {
        throw new Error(
            "الرابط المقدم هو رابط 'نشر على الويب'. هذه الطريقة لا تدعم جلب تبويبات متعددة. يرجى استخدام الرابط من شريط عنوان المتصفح بعد تغيير إعدادات المشاركة إلى 'Anyone with the link can view'."
        );
    }
    
    const sheetIdMatch = GOOGLE_SHEET_URL.match(/\/d\/(.*?)\//);
    if (!sheetIdMatch || !sheetIdMatch[1]) {
        throw new Error("صيغة رابط Google Sheet غير صالحة. يرجى استخدام الرابط الكامل من شريط عنوان المتصفح (مثال: https://docs.google.com/spreadsheets/d/1abc.../edit).");
    }
    const sheetId = sheetIdMatch[1];
    
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
    
    const response = await fetch(url, { cache: 'no-store' }); // Disable cache to get fresh data
    if (!response.ok) {
        throw new Error(`فشل في جلب البيانات للتبويب: ${sheetName}. تأكد من أن التبويب موجود بالاسم الصحيح وأن إعدادات المشاركة للملف هي 'Anyone with the link can view'.`);
    }
    const csvText = await response.text();
    return parseCSV<T>(csvText);
};


// الدالة الرئيسية لجلب جميع البيانات من كل التبويبات
export const fetchAllData = async (): Promise<AppData> => {
    try {
        // الخطوة 1: جلب جميع بيانات الجداول بالتوازي
        const [students, teachers, subjects, grades, announcements, attendance] = await Promise.all([
            writeData('GET_ALL_STUDENTS', {}), // **تعديل**: جلب الطلاب عبر السكريبت لضمان الموثوقية
            fetchSheetData<Teacher>('Teachers'),
            fetchSheetData<Subject>('Subjects'),
            fetchSheetData<Grade>('Grades'),
            fetchSheetData<Announcement>('Announcements'),
            fetchSheetData<Attendance>('Attendance')
        ]);
        
        // الخطوة 2: جلب بيانات اعتماد المدير من السكريبت
        const adminCredentials = await writeData('GET_ADMIN_CREDENTIALS', {});

        // الخطوة 3: دمج وإرجاع جميع البيانات
        return { students, teachers, subjects, grades, announcements, attendance, adminCredentials };

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        throw error;
    }
};


// جديد: دالة لإرسال البيانات إلى Google Sheet عبر Apps Script
export const writeData = async (action: string, payload: any): Promise<any> => {
    if (GOOGLE_SCRIPT_URL === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' || !GOOGLE_SCRIPT_URL) {
        throw new Error("لم يتم تكوين Google Apps Script URL في ملف config.ts. لا يمكن حفظ البيانات. يرجى اتباع تعليمات الإعداد.");
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                // By changing the Content-Type to text/plain, this becomes a "simple request"
                // which avoids the browser sending a pre-flight (OPTIONS) request.
                // This is a common workaround for CORS issues with Google Apps Script.
                // The Apps Script backend correctly parses the JSON string from the text body.
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action, payload }),
            redirect: 'follow',
        });
        
        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'Unknown error from Apps Script');
        }

        return result.data;
    } catch (error) {
        console.error(`Error writing data for action ${action}:`, error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             throw new Error("حدث خطأ في الشبكة أثناء محاولة حفظ البيانات. قد يكون هذا بسبب مشكلة في الاتصال بالإنترنت، أو أن Google Apps Script API غير متاح أو تم تكوينه بشكل غير صحيح. يرجى التحقق من إعدادات النشر الخاصة بالسكريبت والتأكد من أن خيار 'Who has access' مضبوط على 'Anyone'.");
        }
        throw error;
    }
};