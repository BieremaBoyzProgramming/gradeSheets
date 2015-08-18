/**
 * Author: Bierema Boyz Publishing
 * Copyright (c) 2015 Bierema Boyz Publishing. All rights reserved.
 * @license MIT
 */

var bieremaBoyz = bieremaBoyz || {};
bieremaBoyz.gradeSheets = bieremaBoyz.gradeSheets || {};

bieremaBoyz.gradeSheets.parseDSV =
  function() {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js');

    function asciiDecoder(buffer) {
      return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }
    function ucs2Decoder(buffer) {
      return (
        String.fromCharCode
          .apply(
            null,
            buffer.byteLength >= 2
                && 0xFEFF === (new Uint16Array(buffer, 0, 2))[0]
              ? new Uint16Array(buffer, 2)
              : new Uint16Array(buffer)
          )
      );
    }

    var file;

    onmessage = function(event) {
      var i;

      if (event.data.file) {
         file = event.data.file;
      }
      else {
        var uInt8Array =
          new Uint8Array(event.data, 0, Math.min(3, event.data.byteLength));
        var decoders = [];
        if (
          event.data.byteLength < 2
            || 0xFEFF
                !== (
                  new Uint16Array(
                    event.data,
                    0,
                    Math.min(2, event.data.byteLength))
                  )[0]
        ) {
          decoders.push(asciiDecoder);
        }
        if (
          !(
            event.data.byteLength % 2
              || [0xEF, 0xBB, 0xBF]
                  .every(function(b, i) { return b === uInt8Array[i]; })
          )
        ) {
          decoders.push(ucs2Decoder);
        }
        var parsers =
          file.type === 'text/csv' || /\.csv$/i.test(file.name)
            ? [d3.tsv, d3.csv]
            : [d3.csv, d3.tsv];
        var parserDecoders = [];
        parsers.forEach(
          function(parser) {
            decoders.forEach(
              function(decoder) {
                parserDecoders.push({ parser: parser, decoder: decoder });
              }
            )
          }
        );
        var errors = [];
        while (parserDecoders.length) {
          var parserDecoder = parserDecoders.pop();
          var rows =
            parserDecoder.parser.parseRows(parserDecoder.decoder(event.data));
          var headingRows =
            { assignment: true, total: true, category: [], 'class': true };
          var students = [];
          var length = -1;
          var error = null;
          rows.reverse();
          while (rows.length) {
            var row = rows.pop();
            if (row[0]) {
              var rowHeading = row[0].toLowerCase();
              if (headingRows.hasOwnProperty(rowHeading)) {
                headingRows[rowHeading] = row;
              }
              else {
                students.push(row);
              }
              if (row.length > length) {
                if (length >= 0) {
                  error = 'All rows must contain the same number of cells.';
                  break;
                }
                length = row.length;
              }
            }
          }
          if (error) {
            errors.push(error);
            continue;
          }
          else if (!headingRows.assignment.length) {
            errors.push('A row labeled "assignment" could not be found.');
            continue;
          }
          else if (!headingRows.total.length) {
            errors.push('A row labeled "total" could not be found.');
            continue;
          }
          else if (!headingRows['class'].length) {
            errors.push('A row labeled "class" could not be found.');
            continue;
          }
          var result = [];
          var categories = {};
          result.categories = [];
          result.file = file;
          result.name = headingRows['class'][1];
          var assignments = [];
          if (!headingRows.category.length) {
            headingRows.category = Array.apply(null, Array(length)).map(String);
          }
          for (i = 1; i < length; i++) {
            if (headingRows.assignment[i]) {
              var category = headingRows.category[i];
              if (!categories[category]) {
                categories[category] = true;
                result.categories.push(category);
              }
              assignments[i] = {
                name: headingRows.assignment[i],
                total: headingRows.total[i]
              };
            }
          }
          students.forEach(
            function(student, i) {
              var records = [];
              records.index = i;
              records['class'] = result;
              records.name = student[0];
              records.assignments = {};
              result.categories.forEach(
                function(category) {
                  var assignmentsInCategory = [];
                  assignmentsInCategory.category = category;
                  records.assignments[category] = assignmentsInCategory;
                }
              );
              for (i = 1; i < student.length; i++) {
                if (assignments[i]) {
                  records.assignments[headingRows.category[i]]
                    .push(
                      {
                        student: records,
                        assignment: assignments[i],
                        score: student[i]
                      }
                    );
                }
                else if (student[i]) {
                  records.push(student[i]);
                }
              }
              result.push(records);
            }
          );
          postMessage(result);
          return;
        }
        errors.unshift(
          ': The following error messages resulted while attempting to use '
            + 'various encodings and delimiters:');
        postMessage(
          {
            error:
              { beginning: 'Error parsing file ', end: errors.join('<br>')}
          }
        );
      }
    };
  };

if (typeof window === 'undefined') {
  bieremaBoyz.gradeSheets.parseDSV();
}