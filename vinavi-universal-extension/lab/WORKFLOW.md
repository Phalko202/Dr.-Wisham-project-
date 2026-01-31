# HMH Vinavi Lab Extension - User Workflow Guide

## 🔄 Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: SEARCH PATIENT                                         │
├─────────────────────────────────────────────────────────────────┤
│  • Enter patient ID, name, NIC, or phone number                 │
│  • Click "Search" button                                        │
│  • View patient cards in grid layout                            │
│  • Click on patient card to continue                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: VIEW PATIENT DETAILS                                   │
├─────────────────────────────────────────────────────────────────┤
│  • Review patient information (Name, ID, Age, Gender, etc.)     │
│  • View all doctor episodes for the patient                     │
│  • Episodes shown with: ID, Doctor, Department, Date            │
│  • Click on episode card to open lab ordering                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: ORDER LAB TESTS                                        │
├─────────────────────────────────────────────────────────────────┤
│  • Episode info displayed at top                                │
│  • Lab catalog shown in table format                            │
│  • Browse 20+ categories with 200+ tests                        │
│  • Use search box to filter tests                               │
│  • Check boxes to select individual tests                       │
│  • OR click "SELECT ALL" to select entire category              │
│  • Selected count updates in real-time                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: SUBMIT ORDER                                           │
├─────────────────────────────────────────────────────────────────┤
│  • Review selected test count at bottom                         │
│  • Click "Submit Lab Order to Vinavi" button                    │
│  • Order sent to Vinavi API                                     │
│  • Success modal shows confirmation                             │
│  • Order ID displayed                                           │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Dashboard Navigation

### Sidebar Menu

1. **🔍 Search Patient** - Main search interface
2. **🕐 Order History** - View past lab orders
3. **📋 Lab Catalog** - Browse full test catalog
4. **⚙️ Settings** - API configuration and connection test

### Back Navigation

- Each view has a "← Back" button
- Search → Patient Details → Lab Order
- Easy navigation between steps

## 🎯 Quick Actions

### Patient Search View
- Type to search
- Press Enter to submit
- Click patient card to select
- Use quick filters: All | Today's Patients | Recent

### Patient Details View
- View patient information
- Episode count badge
- Click episode card to order tests
- Back button returns to search

### Lab Order View
- Search tests by code, ASND, or name
- Click checkbox to select/deselect
- Click "SELECT ALL" for entire category
- Selection counter shows total selected
- Submit button enabled when tests selected

## 🎨 Visual Indicators

### Colors
- **Blue (#2563eb)** - Primary actions, selections, active items
- **White** - Backgrounds, text
- **Gray** - Secondary text, borders

### States
- **Hover** - Cards lift and border changes to blue
- **Active** - Blue background on navigation items
- **Selected** - Blue checkboxes for selected tests
- **Disabled** - Gray button when no tests selected

### Feedback
- **Loading** - Blue spinner animation
- **Success** - Modal with checkmark icon
- **Error** - Red toast notification at bottom-right
- **Empty** - Centered message with icon

## 🔐 Authentication

Extension reads authentication from Aasandha Portal:
1. Log into https://auth.aasandha.mv first
2. Extension uses session cookies automatically
3. Green dot = Connected to Vinavi
4. Red dot = Authentication required

## ⚡ Keyboard Shortcuts

- **Enter** in search box = Perform search
- **Escape** = Close modal (when open)
- Navigation via Tab key

## 📊 Data Display

### Patient Cards
```
┌─────────────────────────────┐
│ PATIENT NAME         [Badge]│
│ ID: XXXXXXXXX               │
│                             │
│ Age/Gender    NIC           │
│ 35 / Male     A123456       │
│                             │
│ Phone         Last Visit    │
│ 7777777       12/11/2024    │
└─────────────────────────────┘
```

### Episode Cards
```
┌─────────────────────────────┐
│ Episode #12345    [Status]  │
├─────────────────────────────┤
│ Doctor:      Dr. Ahmed      │
│ Department:  OPD            │
│ Date:        18/11/2024     │
│ Complaint:   Fever          │
└─────────────────────────────┘
```

### Lab Catalog Table
```
┌────────────────────────────────────────────┐
│ HAEMATOLOGY                   [SELECT ALL] │
├───┬──────┬────────┬──────────────────────┤
│Sel│ Code │  ASND  │   Investigation      │
├───┼──────┼────────┼──────────────────────┤
│ ☑ │ 920  │ L0118  │ Complete Hemogram   │
│ ☐ │ 9543 │ L0017  │ Hb/PCV              │
└───┴──────┴────────┴──────────────────────┘
```

## 🎓 Tips

1. **Search Efficiently**: Use specific terms (ID, NIC) for faster results
2. **Browse Categories**: Click category headers to expand/collapse
3. **Bulk Selection**: Use "SELECT ALL" for routine panels
4. **Quick Filter**: Type in search box to filter tests instantly
5. **Check Status**: Monitor connection dot in header
6. **Review Before Submit**: Check selected count before submitting

## 🔧 Troubleshooting

### Can't find patient
- Verify patient exists in Vinavi
- Try different search terms
- Check API connection in Settings

### Tests not selecting
- Click directly on checkbox
- Ensure episode is selected first
- Refresh page if needed

### Submit button disabled
- Must select at least 1 test
- Check authentication status
- Verify episode is active

### API errors
- Go to Settings → Test Connection
- Ensure logged into Aasandha Portal
- Check network connection
