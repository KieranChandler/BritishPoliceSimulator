SmartStudio for Unity 3.5
Version 1.3 (Beta), November 2012
Copyright © 2012, Marcelo Roca
-----------------------------------------------

SmartStudio for Unity a set of tools for Unity Developers that works inside Unity: 
- Script/text inspector (.cs, .js, .boo, .xml, .json, .sql)
- Dedicated script/text editor window
- Simple To-do list editor

Standard Edition:
=======================
- Cost 10$
- View files in the Inspector 
- Line numbering
- Syntax highlighting
- Code folding
- Basic Navigation, selection, copy to clipboard
- Unity script help (F1)
- Open file in a separate editor window
- Basic Editing 
- Search box
- User defined custom editor themes
- Backup and restore edited files
- Simple To-Do List

Free Edition:
=============
- Cost Free
- All the Standar Edition without the save option

Features that will be implemented and included in the Basic Edition
- Unlimited Undo/Redo


Supported files:
================
This editor supports these file types: readme, .txt, .cs, .js, .boo, .xml, .sql, .json


How to Use:
===========

* Text editor, code editor:
---------------------------
Click on any supported file type, and the inspector will show your file in the inspector. 

If you want to edit or open in separate window, click the "Open" button on the inspector toolbar, this will open a new window where you
can edit and save the file. 

* To-do list
------------
To create a new To-Do list you need to use the "Window-SmartStudio->New To-Do", this will create a new To-Do file in
the "Plugins/Editor/SmartStudio/Todo" folder.

When you click on the created file, a custom inspector will permit you to create and edit tasks.

* Themes:
---------
To create new theme you need to use the "Window->SmartStudio->New Theme" in the Unity editor menu, this will create a new 
theme file in the "Plugins/Editor/SmartStudio/Themes" folder.

When you click on the created file a custom inspector will permit you to change and save the colors used
on the editor. If you want to use the new theme, click on the button "Use this theme" on the toolbar
button.

* Help:
-------
If you click F1 when you are over a word in the inspector or the code editor window, the default web browser
will be open showin the Unity script reference for that word.

* Backup & restore
------------------
If you edit and save any file, a copy file will be created in a backup folder. You can see the file
content and restore if you want. 


How to Upgrade:
===============

* Upgrade from version 1.2:

You need to remove the folder "Plugins/Editor/bin" and "Plugind/Editor/SmartStudio"


Known Issues:
=============
- Undo/Redo are not implemented
- Syntax highlighting for multiline comments and strings are not updated in realtime.


Known limitations:
==================
- Some key combinations can't be implemented: Ctrl+Z (undo), Ctrl+S (save)
- Key AltGr can't be used
- Unity 4 is not supported now, but will be supported in the near future


Beta Testing
============
This is an officially released version of a SmartStudio which includes most of the product's 
functionality.

Please note that a beta version is NOT the final version of the product and therefore the 
developer does not guarantee an absence of errors that may disrupt the computer's operation 
and/or result in data loss.

Consequently, beta testers use the beta version at their own risk and the developer bears no 
responsibility for any consequences arising out of the use of the beta version.

Shorcut Keys: (http://www.dofactory.com/ShortCutKeys/ShortCutKeys.aspx)
=============

GENERAL:
--------
Shortcut                    Description                                              Implemented
Ctrl-X                      Cuts all selected lines or the current line if nothing   Yes
						    has been selected to the clipboard
Ctrl-C                      Copies the currently selected item to the clipboard      Yes
Ctrl-V                      Pastes the item in the clipboard at the cursor           Yes
Ctrl-Z or                   Undo previous editing action                             No (1)(2)
Alt-Backspace                                                                        
Ctrl-Y                      Redo the previous undo action                            No (1)
Esc                         Closes a menu or dialog, cancels an operation in         Yes 
                            progress, clear selection, or places focus in the 
						    current document window
Ctrl-S or                   Saves the selected files in the current project (usually No (3)
Alt-S                       the file that is being edited)
Ctrl-Shift-S                Saves all documents and projects                         No (3)

TEXT NAVIGATION:
----------------
Shortcut                    Description                                              Implemented
Left Arrow                  Moves the cursor one character to the left               Yes
Right Arrow                 Moves the cursor one character to the right              Yes
Down Arrow                  Moves the cursor down one line                           Yes
Up Arrow                    Moves the cursor up one line                             Yes
Page Down                   Scrolls down one screen in the editor window             Yes
Page Up                     Scrolls up one screen in the editor window               Yes
End                         Moves the cursor to the end of the current line          Yes 
Home                        Moves the cursor to the beginning of the line.           Partial (1)
                            If you press Home when the cursor is already at 
						    the start of the line, it will toggle the cursor
						    between the first non-whitespace character and the 
						    real start of the line
Ctrl-End                    Moves the cursor to the end of the document              Yes
Ctrl-Home                   Moves the cursor to the start of the document            Yes
Ctrl-G                      Displays the Go to Line dialog.                          No (1)
Ctrl-]                      Moves the cursor to the matching brace in the document.  No (1)
                            If the cursor is on an opening brace, this will move to 
						    the corresponding closing brace and vice versa
Ctrl-Down Arrow             Scrolls text down one line but does not move the cursor. Yes
                            This is useful for scrolling more text into view without 
						    losing your place. Available only in text editors
Ctrl-Up Arrow               Scrolls text up one line but does not move the cursor.   Yes
                            Available only in text editors
Ctrl-Right Arrow            Moves the cursor one word to the right                   No (1)
Ctrl-Left Arrow             Moves the cursor one word to the left                    No (1)

TEXT MANIPULATION
-----------------
Shortcut                    Description                                              Implemented
Enter                       Inserts a new line                                       Yes
Delete                      Deletes one character to the right of the cursor         Yes
Insert                      Toggles between insert and overtype insertion modes      No (1)
Tab                         Indents the currently selected line or lines by one      Partial
                            tab stop. If there is no selection, this inserts a 
						    tab stop
Shift-Tab                   Moves current line or selected lines one tab stop to     No (1)
                            the left
Backspace                   Deletes one character to the left of the cursor
Ctrl-K+Ctrl-C               Marks the current line or selected lines of code         No (1)
                            as a comment
Ctrl-K+Ctrl-U               Removes the comment syntax from the current line or      No (1)
                            currently selected lines of code
Ctrl-T or                   Swaps the characters on either side of the cursor.       No (1)
Shift-Enter                 (For example, AC|BD becomes AB|CD.)
Ctrl-Enter                  Inserts a blank line above the cursor                    No (1)
Ctrl-Shift-Enter            Inserts a blank line below the cursor                    No (1)
Ctrl-R, Ctrl-W              Shows or hides spaces and tab marks                      No (1)
Ctrl-Delete                 Deletes the word to the right of the cursor              No (1)
Ctrl-Backspace              Deletes the word to the left of the cursor               No (1)

TEXT SELECTION
--------------
Shortcut                    Description                                              Implemented
Shift-Left Arrow            Moves the cursor to the left one character, extending    Yes
                            the selection
Shift-Alt-Left Arrow        Moves the cursor to the left one character, extending    No (1)
                            the column selection
Shift-Right Arrow           Moves the cursor to the right one character, extending   Yes
                            the selection
Shift-Alt-Right Arrow       Moves the cursor to the right one character, extending   No (1)
                            the column selection
Ctrl-Shift-End              Moves the cursor to the end of the document, extending   Yes
                            the selection
Ctrl-Shift-Home             Moves the cursor to the start of the document, extending Yes
                            the selection
Ctrl-Shift-]                Moves the cursor to the next brace, extending the        No (1)
                            selection
Shift-Down Arrow            Moves the cursor down one line, extending the            Yes
                            selection
Shift-Alt-Down Arrow        Moves the cursor down one line, extending the column     No (1)
                            selection
Shift-End                   Moves the cursor to the end of the current line,         Yes
                            extending the selection
Shift-Alt-End               Moves the cursor to the end of the line, extending the   No (1)
                            column selection
Shift-Home                  Moves the cursor to the start of the line, extending     Yes
                            the selection
Shift-Alt-Home              Moves the cursor to the start of the line, extending the No (1)
                            column selection
Shift-Up Arrow              Moves the cursor up one line, extending the selection    Yes
Shift-Alt-Up Arrow          Moves the cursor up one line, extending the column       No (1)
                            selection
Shift-Page Down             Extends selection down one page                          Yes
Shift-Page Up               Extends selection up one page                            Yes
Ctrl-A                      Selects everything in the current document               Yes
Ctrl-W                      Selects the word containing the cursor or the word to    No (1)
                            the right of the cursor
Ctrl-Shift-Page Down        Moves the cursor to the last line in view, extending the Yes
                            selection
Ctrl-Shift-Page Up          Moves the cursor to the top of the current window,       Yes
                            extending the selection
Ctrl-Shift-Alt-Right Arrow  Moves the cursor to the right one word, extending the    No (1)
                            column selection
Ctrl-Shift-Left Arrow       Moves the cursor one word to the left, extending the     No (1)
                            selection
Ctrl-Shift-Alt-Left Arrow   Moves the cursor to the left one word, extending the     No (1)
                            column selection

SEARCH AND REPLACE
------------------
Shortcut                    Description                                              Implemented
Ctrl-F                      Displays the Find dialog                                 No (1)
F3                          Finds the next occurrence of the previous search text    No (1)
Ctrl-F3                     Finds the next occurrence of the currently selected      No (1)
                            text or the word under the cursor if there is no 
							selection
Shift-F3                    Finds the previous occurrence of the search text         No (1)
Ctrl-Shift-F3               Finds the previous occurrence of the currently selected  No (1)
                            text or the word under the cursor

HELP
----
Shortcut                    Description                                              Implemented
F1                          Help will try to display a topic relevant to the text    Yes
                            under the cursor


(1) These features will be gradually implemented in the future sub-versions.
(2) Ctrl-Z can not be used for Undo. Will be used only the alternative Alt-Backspace
(3) Ctrl-S and Ctrl-Shift-S can not be used for Save. Will be used Alt-S

Support:
========
- support@marceloroca.com 


----
Changelog:
1.3 (November 2012)
- Rewrite shortcuts management
- Shortcuts combination keys defined
- Code cleaned (found and solved a lot of bugs)
- F1 (help)
- Code folding
- Theme editor

1.2 (October 2012)
- Basic editing 

1.1 (October 2012)
- Search box
- Basic Keyboard controls

1.0 (October 2012)
- View files in the Inspector and open it in a separate window
- Line numbering
- Syntax highlighting
- Basic Navigation, selection, copy to clipboard



