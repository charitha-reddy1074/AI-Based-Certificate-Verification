# Quick Reference: Bulk Upload & CGPA Features

## 📋 CSV Format (Quick Copy-Paste Template)

```csv
studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
1,Student Name,2023001,Computer Science,University Name,2019,2023,3.8
```

## 🚀 How to Upload

### Step 1: Access Admin Dashboard
- Login as Admin
- Navigate to **Issue Certificate** tab

### Step 2: Click Bulk Upload
- Find the **"Bulk Upload (CSV)"** button (green button)
- Click it to open upload dialog

### Step 3: Download Sample
- Click **"Download Sample CSV"**
- Modify with your actual data
- Save as `.csv` file

### Step 4: Upload Your File
- Click to select or drag-drop your CSV
- Click **"Upload Certificates"**
- System will process and show results

### Step 5: Review Results
- ✅ Check "Successfully uploaded" count
- ⚠️ Review any failed rows with errors
- 📊 Confirm certificates are in system

---

## 📝 Required CSV Columns

| # | Column Name | Type | Required | Example |
|---|------------|------|----------|---------|
| 1 | studentId | Number | ✅ Yes | 1 |
| 2 | name | Text | ✅ Yes | John Doe |
| 3 | rollNumber | Text | ✅ Yes | CS2023001 |
| 4 | branch | Text | ✅ Yes | Computer Science |
| 5 | university | Text | ✅ Yes | XYZ University |
| 6 | joiningYear | Year | ✅ Yes | 2019 |
| 7 | passingYear | Year | ✅ Yes | 2023 |
| 8 | cgpa | Text | ❌ Optional | 3.8 |

---

## ✅ Valid CGPA Formats

Any of these work:
- `3.8` (scale 4.0)
- `8.9/10` (scale 10)
- `89%` (percentage)
- `A+` (letter grade)
- `8.9` (decimal)
- `92` (numeric)

---

## 🎯 CGPA Usage

### In Admin Dashboard
- Added to single certificate form
- Optional field (leave blank if not available)

### In Downloaded PDF
- Shows in "Academic Details" section
- Label: "Cumulative GPA"
- Displayed in emerald green color

### In Verification Portal
- Shows in certificate details view
- Under "Academic Details" section
- Highlighted for easy viewing

---

## ⚠️ Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing required fields" | Header columns missing | Use exact header names |
| "Certificate already exists for roll number X" | Roll number already in system | Check/remove duplicates |
| "Invalid data types" | Non-numeric in number field | Verify studentId and years are numbers |
| "CSV must have header row" | No header provided | Add header row as first line |

---

## 🔒 Security & Validation

✅ Admin authentication required  
✅ All inputs validated server-side  
✅ Automatic blockchain hash generation  
✅ Unique QR codes per certificate  
✅ Activity logging for all uploads  
✅ Error reporting with row details  

---

## 📊 Bulk Upload Response Example

```json
{
  "success": true,
  "message": "Bulk upload completed. 5 certificates uploaded, 1 failed.",
  "uploadedCount": 5,
  "failedCount": 1,
  "errors": [
    {
      "row": 7,
      "error": "Certificate already exists for roll number CS2023004"
    }
  ]
}
```

---

## 🎓 Example CSV Files

### Minimal (No CGPA)
```csv
studentId,name,rollNumber,branch,university,joiningYear,passingYear
1,John Doe,2023001,Computer Science,XYZ University,2019,2023
2,Jane Smith,2023002,Computer Science,XYZ University,2019,2023
```

### With CGPA
```csv
studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
1,John Doe,2023001,Computer Science,XYZ University,2019,2023,3.8
2,Jane Smith,2023002,Computer Science,XYZ University,2019,2023,3.9
3,Bob Johnson,2023003,Electrical Engineering,XYZ University,2019,2023,8.7/10
```

### Multiple Departments
```csv
studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
1,Alice Johnson,CS2023001,Computer Science,Tech University,2019,2023,3.85
2,Bob Smith,EE2023001,Electrical Engineering,Tech University,2019,2023,3.72
3,Carol Davis,ME2023001,Mechanical Engineering,Tech University,2019,2023,3.9
4,David Wilson,CE2023001,Civil Engineering,Tech University,2019,2023,3.65
5,Emma Brown,CS2023002,Computer Science,Tech University,2019,2023,3.78
```

---

## 🔄 Workflow Comparison

### Before (Single Certificate)
1. Click Issue Certificate
2. Fill form manually
3. Submit
4. Download PDF
5. Repeat for each student ⏰ Time consuming

### After (Bulk Upload)
1. Click Bulk Upload
2. Upload CSV with all students
3. Done! ⚡ Instant processing
4. All certificates created simultaneously

---

## 🎯 Typical Use Cases

### Batch Graduation
- End of semester: Upload entire class
- 100+ students in one upload
- All get certificates with blockchain hashes

### Update Scores
- Prepare CSV with updated CGPA
- Upload new batch
- All certificates show latest scores

### Multiple Institutions
- Upload students from different universities
- Each gets proper institution name
- Maintains accurate records

---

## 📞 Troubleshooting

### Upload Hangs?
- Check CSV file size (should be small)
- Try smaller batch (5-10 records first)
- Check internet connection

### Can't Find Button?
- Ensure you're logged in as Admin
- Go to Admin Dashboard → Issue Certificate tab
- Button is on the right side of header

### CGPA Not Showing?
- Verify it's in CSV (even if optional)
- Check PDF is freshly downloaded
- Visit verification portal to confirm

### Duplicate Error?
- Check system for existing roll numbers
- Use Find/Replace in CSV editor
- Modify duplicate roll numbers before re-upload

---

## 📦 What's Generated Automatically

✅ Blockchain block number  
✅ Block hash (256-bit hex)  
✅ Previous hash (256-bit hex)  
✅ Transaction hash (256-bit hex)  
✅ QR code (scannable)  
✅ Certificate ID  

---

## 🔗 File Locations

- **Component**: `client/src/components/BulkUploadDialog.tsx`
- **Admin Page**: `client/src/pages/AdminDashboard.tsx`
- **API**: `server/routes.ts` (POST `/api/admin/certificates/bulk/upload`)
- **Database**: `server/storage.ts` (MongoDB) + `shared/schema.ts` (PostgreSQL)
- **Format Guide**: `CSV_UPLOAD_FORMAT_GUIDE.md`

---

## ⚡ Performance Tips

1. **Test First**: Upload 5-10 records to test CSV format
2. **Split Large Batches**: Break 1000+ students into smaller batches
3. **Verify Beforehand**: Check for duplicates before upload
4. **Keep Backup**: Always keep backup of your CSV
5. **During Off-Peak**: Upload during low traffic times

---

## 🎓 Sample Department Codes

```
Computer Science (CS)
Electrical Engineering (EE)
Mechanical Engineering (ME)
Civil Engineering (CE)
Electronics & Communication (EC)
Information Technology (IT)
Chemical Engineering (CHE)
Biotechnology (BT)
Business Administration (MBA)
```

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅
