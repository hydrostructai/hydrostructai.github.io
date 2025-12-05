# Quick Start Guide - New Features
**Date:** December 5, 2025

---

## 🎉 What's New?

### 1. Beautiful Loading Experience
- **Full-screen overlay** appears when you load the page
- **Animated spinner** shows WASM is loading
- **Smooth fade-out** when ready
- **No more waiting in the dark!**

### 2. File Management Toolbar
Located above the "Run Analysis" button in the sidebar:

```
┌─────────────────────────────────┐
│ [New] [Open] [Save]             │
│                                 │
│ [Run Analysis]                  │
└─────────────────────────────────┘
```

#### **New Button** 📄
- Clears all current data
- Resets to default values
- Confirmation dialog protects your work

#### **Open Button** 📂
- Loads saved input files
- Supports `.csv` and `.inp` formats
- Automatically fills all forms

#### **Save Button** 💾
- Exports current data to file
- Choose CSV or INP format
- Download to your computer

---

## 📋 How to Use File Management

### Scenario 1: Starting a New Project
1. Click **[New]** button
2. Confirm "Yes" in dialog
3. All fields reset to safe defaults
4. Start entering your data

### Scenario 2: Saving Your Work
1. Fill in all your input data
2. Click **[Save]** button
3. In the prompt, type:
   - `1` for CSV format (simple, readable)
   - `2` for INP format (organized sections)
4. File downloads automatically
5. Filename examples:
   - `sheetpile_input.csv`
   - `pilegroup_input.inp`

### Scenario 3: Loading Previous Work
1. Click **[Open]** button
2. Select your saved `.csv` or `.inp` file
3. All forms populate automatically
4. Review and modify as needed
5. Click "Run Analysis"

### Scenario 4: Sharing with Colleagues
1. Save your input file using **[Save]**
2. Email the file to colleague
3. Colleague clicks **[Open]** and selects your file
4. They see exactly your input data
5. Consistent results across team!

---

## 🎨 Sheet Pile FEM Tab Improvements

### Before ❌
- Inconsistent table styling
- No default values
- Empty inputs
- Confusing layout

### After ✅
- Beautiful consistent styling
- Smart default values:
  - **Point Loads:** 10 kN/m
  - **Distributed Loads:** 6 kN/m²
- Color-coded headers
- Icons for clarity
- FREE tier warnings
- Helpful notes

### New Tab Features

#### **Anchors Tab** ⚓
- Starts with **0 rows** (clean slate)
- Click "Thêm Neo/Chống" to add
- **FREE Tier:** Max 1 anchor
- **PRO:** Unlimited anchors
- Default values: Depth=2m, K=50,000 kN/m/m

#### **Point Loads Tab** 🎯
- Starts with **0 rows**
- Click "Thêm Tải trọng" to add
- Default load: **10 kN/m** 
- Perfect for column loads

#### **Distributed Loads Tab** 📦
- Starts with **1 sample row**
- Click "Thêm Tải phân bố" to add more
- Default value: **6 kN/m²**
- Perfect for storage areas

---

## 🆓 FREE vs PRO Features

### FREE Tier Limits
- **Soil Layers:** Max 2
- **Anchors:** Max 1 ⭐
- **Piles (Pile Group):** Max 4
- All basic calculations work
- Can save/load files

### PRO Tier Benefits
- **Unlimited** soil layers
- **Unlimited** anchors
- **Unlimited** piles
- Priority technical support
- Detailed reports export
- All future features

**To activate PRO:** Navigate to "Bản quyền" tab and enter your license key.

---

## 🚀 Performance Tips

### Fast Loading
- **Good connection:** WASM loads in 1-2 seconds
- **Slow connection:** Loading overlay keeps you informed
- **Cached:** Subsequent loads are faster

### Cache Issues Fixed
- If we update the WASM, it will auto-refresh
- No need to clear browser cache manually
- Always get the latest version

### File Size
- **CSV files:** Very small (~1-5 KB)
- **INP files:** Similar size
- Easy to email, store, or backup

---

## 💡 Pro Tips

### Tip 1: Save Often
Save your work after major changes using the **[Save]** button. Think of it like "Ctrl+S" in Word.

### Tip 2: Use Templates
Create template files for common scenarios:
- `template_shallow_excavation.csv`
- `template_deep_basement.csv`
- `template_24pile_group.inp`

### Tip 3: Backup Important Projects
Keep copies of important input files in multiple locations:
- Computer hard drive
- Cloud storage (Google Drive, Dropbox)
- Email to yourself

### Tip 4: File Naming
Use descriptive names:
- ❌ `input1.csv`
- ✅ `ProjectA_Phase2_SheetPile_20251205.csv`

### Tip 5: Comment Your Files
CSV and INP formats support comments starting with `#`:
```csv
# Client: ABC Construction
# Project: Metro Station A
# Date: 2025-12-05
# Engineer: Nguyen Van A
E,210000000
```

---

## 🐛 Troubleshooting

### Problem: Loading overlay doesn't appear
**Solution:** Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)

### Problem: WASM takes forever to load
**Solution:** 
- Check your internet connection
- Try a different browser
- Clear browser cache if really stuck

### Problem: Can't open my saved file
**Solution:**
- Make sure file extension is `.csv` or `.inp`
- Open file in text editor to check format
- Re-save from the app if corrupted

### Problem: FREE tier limit reached
**Solution:**
- Either remove extra rows
- Or activate PRO license in "Bản quyền" tab
- Test with `valid` or `pro` in the license key field

### Problem: Data doesn't match after loading
**Solution:**
- Check if file format is correct
- Manually verify a few key values
- Re-save the file if needed

---

## 📞 Support

**Email:** ha.nguyen@hydrostructai.com  
**Phone:** +84 374874142  
**Website:** https://hydrostructai.github.io

For feature requests or bug reports, please email with:
1. Description of the issue
2. Steps to reproduce
3. Screenshots if applicable
4. Your input file (if relevant)

---

## 🎓 Example Workflow

### Complete Project from Start to Finish

#### Step 1: Start New Project
```
1. Load page → See loading overlay
2. WASM loads → Overlay fades
3. Click [New] button
4. Confirm → All fields reset
```

#### Step 2: Enter Data
```
1. Tab 1: Enter wall properties (E, I, L, H)
2. Tab 2: Add soil layers
3. Tab 3: Add anchors (if needed)
4. Tab 4: Add point loads
5. Tab 5: Set water levels
6. Tab 6: Add distributed loads
```

#### Step 3: Save Your Work
```
1. Click [Save] button
2. Type 1 for CSV
3. File downloads as sheetpile_input.csv
4. Check Downloads folder
```

#### Step 4: Run Analysis
```
1. Click "Run Analysis" button
2. Wait for calculation
3. View results in tabs
4. Export charts/reports
```

#### Step 5: Modify and Iterate
```
1. Adjust some inputs
2. Click [Save] again (overwrites file)
3. Run analysis again
4. Compare results
```

#### Step 6: Share with Team
```
1. Email the .csv file to colleagues
2. They click [Open] and select your file
3. Everyone has same inputs
4. Consistent results across team
```

---

## ✅ Checklist for First-Time Users

- [ ] Load the app and see the new loading overlay
- [ ] Click **[New]** and explore the default values
- [ ] Navigate through all tabs (especially Anchors, Point Loads, Distributed Loads)
- [ ] Try adding a row to each table
- [ ] Notice the default values (10 kN, 6 kN/m²)
- [ ] Click **[Save]** and download a CSV file
- [ ] Open the CSV in Notepad to see the format
- [ ] Click **[Open]** and reload the same file
- [ ] Verify all fields populate correctly
- [ ] Try the FREE tier limit (add 2nd anchor)
- [ ] See the license warning
- [ ] Run a sample analysis
- [ ] Save your final input for future reference

---

**Congratulations!** You're now ready to use all the new features. Happy analyzing! 🎉

---

*Generated by Hydro Structure AI Team - December 5, 2025*

