# CSV Bulk Upload Format Guide

## Overview
The CSV bulk upload feature allows administrators to upload multiple student certificates at once using a CSV (Comma-Separated Values) file.

## Required CSV Format

### Header Row (First Row)
The first row must contain the column headers. Column names are **case-insensitive**.

```
studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
```

### Required Fields
- **studentId**: Unique student identifier (numeric) - Must be a valid number
- **name**: Full name of the student - Text field
- **rollNumber**: Student roll number/ID - Text field (must be unique)
- **branch**: Department/Branch name - Text field (e.g., "Computer Science", "Mechanical Engineering")
- **university**: Name of the university - Text field
- **joiningYear**: Year of admission (numeric) - 4-digit year
- **passingYear**: Year of graduation (numeric) - 4-digit year

### Optional Fields
- **cgpa**: Cumulative Grade Point Average or GPA - Text field (e.g., "3.8", "8.5/10", "A+")

## Example CSV File

```csv
studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
1,John Doe,2023001,Computer Science,XYZ University,2019,2023,3.8
2,Jane Smith,2023002,Computer Science,XYZ University,2019,2023,3.9
3,Bob Johnson,2023003,Electrical Engineering,XYZ University,2019,2023,3.7
4,Alice Brown,2023004,Mechanical Engineering,XYZ University,2019,2023,3.6
5,Charlie Wilson,2023005,Civil Engineering,XYZ University,2019,2023,3.5
6,Diana Lee,2023006,Computer Science,XYZ University,2019,2023,8.9/10
```

## Field Specifications

### studentId
- **Type**: Positive Integer
- **Example**: `1`, `2`, `100`, `9999`
- **Constraints**: Must be a valid number, unique per student
- **Required**: Yes

### name
- **Type**: Text (up to 255 characters)
- **Example**: `John Doe`, `Jane Mary Smith`
- **Constraints**: Cannot be empty
- **Required**: Yes

### rollNumber
- **Type**: Text (up to 50 characters)
- **Example**: `CS2021001`, `2023-CS-001`, `2023001`
- **Constraints**: Must be unique (no duplicates allowed in system)
- **Required**: Yes

### branch
- **Type**: Text (up to 100 characters)
- **Example**: `Computer Science`, `Mechanical Engineering`, `Civil Engineering`, `Electrical Engineering`
- **Constraints**: Cannot be empty
- **Required**: Yes

### university
- **Type**: Text (up to 255 characters)
- **Example**: `XYZ University`, `ABC Institute of Technology`
- **Constraints**: Cannot be empty
- **Required**: Yes

### joiningYear
- **Type**: 4-digit Year (Positive Integer)
- **Example**: `2019`, `2020`, `2021`, `2022`
- **Constraints**: Valid academic year
- **Required**: Yes

### passingYear
- **Type**: 4-digit Year (Positive Integer)
- **Example**: `2023`, `2024`, `2025`
- **Constraints**: Must be greater than or equal to joiningYear
- **Required**: Yes

### cgpa
- **Type**: Text (up to 20 characters)
- **Example**: `3.8`, `3.75`, `8.9/10`, `A+`, `9.2`
- **Constraints**: Optional field
- **Required**: No

## Important Rules

1. **Column Order**: The order of columns doesn't matter, but the header names must match exactly (case-insensitive).
2. **Empty Rows**: Empty rows will be skipped automatically.
3. **Duplicate Roll Numbers**: If a certificate already exists for a roll number in the system, that row will fail with an error.
4. **Required Fields**: If any required field is missing, the entire row will be marked as failed.
5. **Data Validation**: 
   - studentId, joiningYear, and passingYear must be valid numbers
   - All text fields will be trimmed of leading/trailing spaces
6. **File Format**: Must be a `.csv` file (comma-separated values)
7. **Character Encoding**: UTF-8 encoding is recommended for special characters

## Upload Process

1. Go to **Admin Dashboard** → **Issue Certificate** tab
2. Click the **"Bulk Upload (CSV)"** button
3. Download the sample CSV format for reference
4. Prepare your CSV file following the format above
5. Select your CSV file
6. Click **"Upload Certificates"**
7. The system will process the file and show:
   - Number of successfully uploaded certificates
   - Number of failed uploads with error details
   - Specific error messages for each failed row

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Missing required fields | A required column is missing | Ensure all required headers are present |
| Certificate already exists for roll number X | Duplicate roll number | Check for duplicates in the system first |
| Invalid number format | studentId or year is not a number | Use only digits for numeric fields |
| Empty line skipped | A row is completely empty | Remove empty rows from CSV |
| Unknown error | Unexpected error occurred | Check data format and try again |

## Success Response

Upon successful upload, you'll see:
- ✅ Success message with count of uploaded certificates
- 📊 Number of certificates uploaded
- ⚠️ Number of failures (if any)
- 📋 Detailed error list for failed rows

## Tips for Success

1. **Use the Sample**: Download and modify the sample CSV provided in the upload dialog
2. **Validate First**: Open CSV in a spreadsheet application (Excel, Google Sheets) to verify formatting
3. **Check Roll Numbers**: Ensure all roll numbers are unique and not already in the system
4. **Format Consistency**: Use consistent formatting for fields like CGPA
5. **Backup**: Keep a backup of your CSV file before uploading
6. **Test**: Consider uploading a small batch first before bulk uploading large datasets

## Supported CGPA Formats

The system accepts any format for CGPA. Common formats:
- Scale 4.0: `3.8`, `3.75`, `4.0`
- Scale 10: `8.9`, `9.2`, `10.0`
- Scale 100: `89`, `92`, `100`
- Grade letters: `A+`, `A`, `B+`, `B`
- Combined: `8.9/10`, `92%`, `A+ (3.9)`

## Blockchain & QR Codes

- Unique blockchain identifiers are **automatically generated** for each certificate
- QR codes are **automatically created** for verification
- Each certificate receives:
  - Unique block number
  - Block hash
  - Previous hash
  - Transaction hash

These are randomly generated and used for verification purposes.

## Need Help?

If you encounter issues:
1. Check the error message in the upload result
2. Verify the CSV format matches the requirements
3. Ensure there are no duplicate roll numbers in the system
4. Download the sample CSV and compare your file format
5. Contact your system administrator if issues persist
