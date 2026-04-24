# Schedule page 
- Combine exports into 1 menu button (json, printable labels, and the excel sheets)

# Students page
- Remove security code feature
- Make a configuration setting for 'default' grade ranges to help with autocomplete
  - This is not an exclusive list, the user may specify something different
  - You can copy from `sample-data.json` to get the unique values for this configuration
  - Also include the original logic of autocompleting existing grade ranges in current data.
- For the 'Week' value auto complete values by suggesting "Mondays".  I.e. If the user started writing "June " suggest "June 8", "June 15", "June 22", "June 29"
  - Also include the original logic of autocompleting existing weeks.
- Sort students by lastname, then firstName (reusing the sort spec from the schedule page)
- Combine the Pre/Post column on the page's table view such that they are two unique icons instead of check boxes
- Use a camera icon for the Photos column, and if "No", make it have a "red No cross circle" overlay icon on top of the camera icon
- If the notes field are blank or empty, do not show the notes icon. (for both special requests and medical)
  
# Import from Excel Sheet
- Auto create friend group if special request mentions another student, and that they are in the same camp
- If Special request or medical Notes is something that means, "no notes", like: "No", "None", "N/A", "n" leave them blank

# Registration page
- In the manage enrollment dialog: Add a "Special requests" icon like in the students page for each student with a notes, and include the tooltip of the notes.  Do not show this note icon if the notes field is blank or empty.

# Schedule page
- Since we can drag and drop students to move them between instances, it now makes sense to preserve the schedule between sessions.  So change the data model to include storing the schedule generated from this page.

# New Feature: Configuration Dialog
- Create a configuration dialog
- One of the tabs in the dialog should be for the import column configuration
- Another tab can be for the default grade ranges.
- Include a 'Reset to defaults' button that restore these settings to the hard coded defaults.
