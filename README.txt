Grade Sheets Generator
======================

The Grade Sheets Generator is a JavaScript application to convert DSVs to
formatted progress reports.

Compatibility
-------------

The application has been tested on Google Chrome 44, Mozilla Firefox 39,
Internet Explorer 11, and Microsoft Edge 20. Other browsers and earlier versions
of these browsers might behave unexpectedly and are not recommended.

* On Internet Explorer and Microsoft Edge, make sure headers and footers are
  disabled before printing; this can be done in Print preview or Page setup for
  IE or in the options presented after choosing Print for Microsoft Edge.

CSVs and TSVs are both supported. The encoding should be either US-ASCII or
UTF-16. BOMs are permitted, but the only supported byte order is the platform
byte order where the generator application is run. If you are on a Windows
computer and using Microsoft Excel to create your DSVs, you should be able to
choose either "CSV (Comma delimited)" (although this is not recommended since it
only supports ASCII characters) or "Unicode text" as the file type.

Only letter paper size is currently supported.

Setup
-----

The application's home page is
https://github.com/BieremaBoyzProgramming/gradeSheets/ . The current version of
the application can be downloaded directly using the URL
https://github.com/BieremaBoyzProgramming/gradeSheets/blob/master/gradeSheets.zip?raw=true
. Once the ZIP file has been saved, extract it; on Windows, this can be done by
right-clicking on the ZIP file and choosing "Extract All."

* If you are updating the application from a previous version, we recommend that
  you delete the previous version first rather than extracting the new version
  over top of the old version; this will ensure that you do not retain files
  that are no longer needed. However, if you do this, be sure that you do not
  simultaneously delete files you want to keep, such as any CSVs that you have
  saved in the folder you are deleting.

Creating the DSVs
-----------------

An example DSV has been provided in the "examples" folder. This indicates the
required components of the DSV, including rows labeled "Assignment," "Total,"
and "Class." The row labeled "Category" is optional. All other rows with a
heading will be treated as students. Columns without an assignment name will be
treated as comments. Multiple comments for a student will be displayed as
separate paragraphs. Be sure to save the DSV using one of the formats listed
under "Compatibility" above.

Generating the progress reports
-------------------------------

To run the application, open gradeSheets.html using one of the supported web
browsers. If you see a warning about JavaScript or CSS being disabled, make sure
they are enabled. You should see an option to browse to choose the DSV(s) and a
date field; if not, make sure you are using an extracted version of the
application rather than using the file directly out of the ZIP file. Be sure you
choose to print the grade sheets on letter size paper. If you are using Internet
Explorer or Microsoft Edge, also make sure headers and footers are disabled
before printing; this can be done in Print preview or Page setup for IE or in
the options presented after choosing Print for Microsoft Edge.

If you modify a file after loading it with the application, the application can
retrieve the updated file, but the method varies across browsers. One option is
to refresh the page and then re-select the files to be loaded. Alternatively,
Internet Explorer and Firefox update the files if the user reselects them from
the file browser field; Chrome and Edge do not do this unless the user deselects
the modified file and then reselects it. Firefox makes it the easiest; simply
refresh the page, and the same files will be re-loaded automatically.