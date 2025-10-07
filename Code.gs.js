// --- CONFIGURATION ---
const SPREADSHEET_ID = '1yASvJ4z7nAWChRuGiTOSCVYwvpulVgHIdqGGaVYlsm4';

const SHEET_NAMES = {
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  SUBJECTS: 'Subjects',
  GRADES: 'Grades',
  ANNOUNCEMENTS: 'Announcements',
  ATTENDANCE: 'Attendance',
  READ_RECEIPTS: 'ReadReceipts'
};

// --- UTILITY FUNCTIONS ---

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(String);
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// --- MAIN POST HANDLER ---

function doPost(e) {
  try {
    // Handle POST requests with a JSON body sent as text/plain
    if (!e.postData || !e.postData.contents) {
      throw new Error("Invalid request: No POST data received.");
    }
    
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};
    let data;

    switch (action) {
      // --- AUTH/GET ACTIONS ---
      case 'GET_ADMIN_CREDENTIALS':
        data = getAdminInfo();
        break;
      case 'GET_ALL_STUDENTS':
        data = getAllStudents();
        break;
      case 'LOGIN_ADMIN':
        data = loginAdmin(payload);
        break;
      case 'LOGIN_STUDENT':
        data = loginStudent(payload);
        break;
      case 'REGISTER_STUDENT':
        data = registerStudent(payload);
        break;
      case 'GET_READ_ANNOUNCEMENTS_BY_STUDENT':
        data = getReadAnnouncements(payload.studentId);
        break;
        
      // --- ADD ACTIONS ---
      case 'ADD_STUDENT':
        data = addRow(SHEET_NAMES.STUDENTS, payload, ['id', 'username', 'name', 'grade', 'class', 'guardianName', 'guardianPhone', 'status', 'password']);
        break;
      case 'ADD_TEACHER':
        data = addRow(SHEET_NAMES.TEACHERS, payload, ['id', 'name', 'subject', 'email', 'phone', 'status']);
        break;
      case 'ADD_SUBJECT':
        data = addRow(SHEET_NAMES.SUBJECTS, payload, ['id', 'name', 'code', 'teacherId']);
        break;
      case 'ADD_ANNOUNCEMENT':
        data = addRow(SHEET_NAMES.ANNOUNCEMENTS, payload, ['id', 'title', 'content', 'category', 'date']);
        break;

      // --- UPDATE ACTIONS ---
      case 'UPDATE_STUDENT':
        data = updateRow(SHEET_NAMES.STUDENTS, payload);
        break;
      case 'UPDATE_TEACHER':
        data = updateRow(SHEET_NAMES.TEACHERS, payload);
        break;
      case 'UPDATE_SUBJECT':
        data = updateRow(SHEET_NAMES.SUBJECTS, payload);
        break;
      case 'UPDATE_ANNOUNCEMENT':
        data = updateRow(SHEET_NAMES.ANNOUNCEMENTS, payload);
        break;
      case 'APPROVE_STUDENT':
        data = approveStudent(payload);
        break;

      // --- DELETE ACTIONS ---
      case 'DELETE_STUDENT':
        data = deleteRow(SHEET_NAMES.STUDENTS, payload.id);
        break;
      case 'DELETE_TEACHER':
        data = deleteRow(SHEET_NAMES.TEACHERS, payload.id);
        break;
      case 'DELETE_SUBJECT':
        data = deleteRow(SHEET_NAMES.SUBJECTS, payload.id);
        break;
      case 'DELETE_ANNOUNCEMENT':
        data = deleteRow(SHEET_NAMES.ANNOUNCEMENTS, payload.id);
        break;

      // --- COMPLEX ACTIONS ---
      case 'SAVE_ATTENDANCE':
        data = saveAttendance(payload);
        break;
      case 'SAVE_GRADES':
        data = saveGrades(payload);
        break;
      case 'MARK_ANNOUNCEMENTS_AS_READ':
        data = markAnnouncementsAsRead(payload);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- ACTION IMPLEMENTATIONS ---

function getAdminCredentialsFromSheet() {
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const creds = sheet.getRange('K1:K2').getValues();
  const username = creds[0][0];
  const password = creds[1][0];
  return { username, password };
}

function getAdminInfo() {
  const { username } = getAdminCredentialsFromSheet();
  if (username) {
    return [{ id: 1, name: 'Admin', username }];
  }
  return [];
}

function getAllStudents() {
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const students = sheetToObjects(sheet);
  // Remove passwords before sending to the client for security
  return students.map(student => {
    const { password, ...studentData } = student;
    return studentData;
  });
}

function loginAdmin({ username, password }) {
  const creds = getAdminCredentialsFromSheet();
  if (creds.username && creds.password && creds.username === username && String(creds.password) === password) {
    return { id: 1, name: 'Admin', username: creds.username };
  }
  return null;
}

function loginStudent({ username, password }) {
  const students = sheetToObjects(getSheet(SHEET_NAMES.STUDENTS));
  const student = students.find(s => s.username === username && String(s.password) === password);
  
  if (student) {
    if (student.status === 'pending') {
      throw new Error('الحساب قيد المراجعة وينتظر موافقة الإدارة.');
    }
    if (student.status === 'inactive') {
      throw new Error('تم تعطيل هذا الحساب. يرجى مراجعة الإدارة.');
    }
    const { password, ...studentData } = student;
    return studentData;
  }
  return null;
}

function registerStudent(payload) {
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const students = sheetToObjects(sheet);

  if (students.some(s => s.username === payload.username)) {
    throw new Error('اسم المستخدم هذا موجود بالفعل.');
  }

  payload.status = 'pending';
  return addRow(SHEET_NAMES.STUDENTS, payload, ['id', 'username', 'name', 'grade', 'class', 'guardianName', 'guardianPhone', 'status', 'password']);
}

function approveStudent({ id }) {
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColIndex = headers.indexOf('id');
  const statusColIndex = headers.indexOf('status');

  if (idColIndex === -1 || statusColIndex === -1) {
    throw new Error('Sheet is missing "id" or "status" columns.');
  }

  const rowIndex = data.findIndex(row => row[idColIndex] == id);
  if (rowIndex === -1) throw new Error(`Student with ID ${id} not found.`);

  sheet.getRange(rowIndex + 1, statusColIndex + 1).setValue('active');

  const updatedRow = sheet.getRange(rowIndex + 1, 1, 1, headers.length).getValues()[0];
  const updatedStudent = {};
  headers.forEach((header, index) => {
    updatedStudent[header] = updatedRow[index];
  });
  
  const { password, ...studentData } = updatedStudent;
  return studentData;
}


function addRow(sheetName, itemData, headersOrder) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  const idCol = sheet.getRange(2, 1, lastRow > 0 ? lastRow -1 : 1, 1).getValues();
  const maxId = Math.max(0, ...idCol.map(([id]) => id).filter(id => !isNaN(id)));
  const newId = maxId + 1;
  itemData.id = newId;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
     sheet.appendRow(headersOrder);
  }

  const row = headersOrder.map(header => itemData[header] || '');
  sheet.appendRow(row);
  
  const { password, ...returnData } = itemData; // Don't send password back
  return returnData;
}


function updateRow(sheetName, itemData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // Wait up to 15 seconds.
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColIndex = headers.indexOf('id');
    if (idColIndex === -1) throw new Error('Sheet must have an "id" column for updates.');

    const rowIndex = data.findIndex(row => row[idColIndex] == itemData.id);
    if (rowIndex === -1) throw new Error(`Item with ID ${itemData.id} not found in ${sheetName}.`);
    
    // Do not update password if it is not provided
    if (itemData.password === '' || itemData.password === undefined) {
      const passwordColIndex = headers.indexOf('password');
      if (passwordColIndex !== -1) {
        itemData.password = data[rowIndex][passwordColIndex];
      }
    }
    
    const row = headers.map(header => itemData[header] !== undefined ? itemData[header] : data[rowIndex][headers.indexOf(header)]);
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
    
    const { password, ...returnData } = itemData; // Don't send password back
    return returnData;
  } finally {
    lock.releaseLock();
  }
}

function deleteRow(sheetName, id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const idColIndex = data[0].indexOf('id');
    if (idColIndex === -1) throw new Error('Sheet must have an "id" column for deletions.');

    const rowIndex = data.findIndex(row => row[idColIndex] == id);
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex + 1);
      return { id: id, status: 'deleted' };
    }
    throw new Error(`Item with ID ${id} not found for deletion.`);
  } finally {
    lock.releaseLock();
  }
}

function saveAttendance({ date, records }) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSheet(SHEET_NAMES.ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    const studentIds = Object.keys(records);
    const savedRecords = [];

    const existingRecords = data.slice(1).reduce((acc, row) => {
        const key = `${row[0]}_${row[1]}`; // studentId_date
        acc[key] = { rowIndex: acc.size + 2 };
        return acc;
    }, new Map());
    
    const newRows = [];

    studentIds.forEach(studentId => {
      const status = records[studentId];
      const key = `${studentId}_${date}`;
      if(existingRecords.has(key)) {
        const { rowIndex } = existingRecords.get(key);
        sheet.getRange(rowIndex, 3).setValue(status);
      } else {
        newRows.push([studentId, date, status]);
      }
      savedRecords.push({ studentId: Number(studentId), date, status });
    });
    
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 3).setValues(newRows);
    }

    return { savedRecords };
  } finally {
    lock.releaseLock();
  }
}

function saveGrades({ subject, gradesToSave }) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet(SHEET_NAMES.GRADES);
    const data = sheet.getDataRange().getValues();
    
    // Create a map for quick lookups
    const gradeMap = new Map();
    for(let i = 1; i < data.length; i++) {
        if(data[i][1] === subject) { // Only map grades for the relevant subject
            gradeMap.set(data[i][0], i + 1); // key: studentId, value: row number
        }
    }
    
    const rowsToDelete = [];
    const valuesToUpdate = {};

    gradesToSave.forEach(grade => {
        const studentId = grade.studentId;
        const score = grade.score;
        const row = gradeMap.get(studentId);

        if (row) { // Record exists
            if (score === null) {
                rowsToDelete.push(row);
            } else {
                valuesToUpdate[row] = score;
            }
        } else if (score !== null) { // New record
            sheet.appendRow([studentId, subject, score]);
        }
    });

    // Batch update values
    for (const row in valuesToUpdate) {
        sheet.getRange(Number(row), 3).setValue(valuesToUpdate[row]);
    }
    
    // Batch delete rows (in reverse order to avoid shifting indices)
    rowsToDelete.sort((a, b) => b - a).forEach(row => {
        sheet.deleteRow(row);
    });

    return { status: 'success' };
  } finally {
    lock.releaseLock();
  }
}

function getReadAnnouncements(studentId) {
    const sheet = getSheet(SHEET_NAMES.READ_RECEIPTS);
    const receipts = sheetToObjects(sheet);
    const readAnnouncementIds = receipts
        .filter(r => r.studentId == studentId)
        .map(r => r.announcementId);
    return { readAnnouncementIds };
}

function markAnnouncementsAsRead({ studentId, announcementIds }) {
    const sheet = getSheet(SHEET_NAMES.READ_RECEIPTS);
    const existingReceipts = new Set(
      sheetToObjects(sheet)
        .filter(r => r.studentId == studentId)
        .map(r => r.announcementId)
    );

    const newReceipts = [];
    announcementIds.forEach(announcementId => {
      if(!existingReceipts.has(announcementId)){
        newReceipts.push([studentId, announcementId, new Date()]);
      }
    });

    if(newReceipts.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newReceipts.length, 3).setValues(newReceipts);
    }
    return { status: 'marked as read' };
}