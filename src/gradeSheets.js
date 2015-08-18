/**
 * Created: 2015-06-13
 * Author: Bierema Boyz Publishing
 * Copyright (c) 2015 Bierema Boyz Publishing. All rights reserved.
 * @license MIT
 */

window.onerror =
  function(type, file, lineNumber) {
    alert('Fatal error: ' + file + ':' + lineNumber + ': ' + type);
  };

!function() {
  var PAGE_HEIGHT = 1056;
  var VERTICAL_MARGIN = 24;

  if (!window.d3) {
    alert(
      'The d3 library did not successfully load. Is the d3.min.js file located '
        + 'in the lib folder that is in the same folder as gradeSheets.js?'
    );
  }

  var date = d3.time.format('%Y-%m-%d')(new Date());

  var filesData = {};
  var filesList = [];

  var fileParserURL;
  function createFileParserWorker() {
    var result;
    try {
      result = new Worker("lib/parseDSV.js");
    }
    catch (exception) {
      fileParserURL =
        fileParserURL
          || URL.createObjectURL(
              new Blob(
                ['(' + bieremaBoyz.gradeSheets.parseDSV + ').call(self);'])
            )
      result = new Worker(fileParserURL);
    }
    result.postMessage(
      {
        documentLocation:
          document.location
              .href
              .substring(0, document.location.href.lastIndexOf('/'))
            + '/lib/'
      }
    );
    return result;
  }
  var fileParserWorkers = [createFileParserWorker()];

  var updateIsScheduled = false;

  function scheduleUpdateOutput() {
    if (!updateIsScheduled) {
      updateIsScheduled = true;
      setTimeout(updateOutput, 0);
    }
  }

  function updateOutput() {
    var i;

    updateIsScheduled = false;

    var output = d3.selectAll('#output');
    var scale =
      output.select('#scaleDiv').node().getBoundingClientRect().width / 816;

    var keys = {};
    Array.prototype.forEach.call(
      filesList,
      function(file) {
        file.key = file.lastModifiedDate.valueOf() + file.name;
        keys[file.key] = true;
        if (filesData.hasOwnProperty(file.key)) {
          file.data = filesData[file.key];
        }
        else {
          file.data = {};
          filesData[file.key] = file.data;
        }
      }
    );
    var key;
    for (key in filesData) {
      if (filesData.hasOwnProperty(key) && !keys.hasOwnProperty(key)) {
        delete filesData[key];
      }
    }
    var errors =
      output.selectAll('.error')
        .data(
          Array.prototype
            .filter
            .call(filesList, function(file) { return file.data.error; }),
          function(d) { return d.key; }
        );
    errors.exit().remove();
    var errorsEnter =
      errors.enter()
        .insert('p', '.loading,.studentContainer')
          .classed('error', true);
    errorsEnter.append('span')
      .html(function(d) { return d.data.error.beginning; });
    errorsEnter.append('span')
      .text(function(d) { return d.name; });
    errorsEnter.append('span').html(function(d) { return d.data.error.end; });

    var loading =
      output.selectAll('.loading')
        .data(
          Array.prototype
            .filter
            .call(
              filesList,
              function(file) {
                return !(file.data.error || file.data.parsedData);
              }
            ),
          function(d) { return d.key; }
        );
    loading.exit()
        .each(
          function(d) {
            if (d.data.reader) {
              d.data.reader.abort();
              delete d.data.reader;
            }
            if (d.data.worker) {
              d.data.worker.abort();
              delete d.data.worker;
            }
          }
        )
        .remove();
    loading.enter()
      .insert('p', '.studentContainer')
        .classed('loading', true)
        .text(function(d) { return 'Loading ' + d.name + '…'; })
        .each(
          function(d) {
            d.data.reader = new FileReader();
            d.data.reader.onerror =
              function() {
                d.data.error =
                  {
                    beginning: 'Error reading file ',
                    end: ': ' + d.data.reader.error
                  };
                delete d.data.reader;
                scheduleUpdateOutput();
              };
            d.data.reader.onload =
              function(event) {
                delete d.data.reader;
                var worker =
                  fileParserWorkers.pop() || createFileParserWorker();
                if (!fileParserWorkers.length) {
                  fileParserWorkers.push(createFileParserWorker());
                }
                worker.onmessage =
                  function(event) {
                    if (event.data.error) {
                      d.data.error = event.data.error;
                    }
                    else {
                      d.data.parsedData = event.data;
                    }
                    fileParserWorkers.push(d.data.worker);
                    delete d.data.worker;
                    scheduleUpdateOutput();
                  };
                worker.onerror =
                  function(event) {
                    d.data.error =
                      {
                        beginning: 'Unexpected error while parsing file ',
                        end:
                          ': ' + event.filename + ':' + event.lineno + ': '
                            + event.message
                      };
                    delete d.data.worker;
                    scheduleUpdateOutput();
                    event.preventDefault();
                  };
                worker.postMessage({ file: d });
                worker.postMessage(event.target.result);
              };
            d.data.reader.readAsArrayBuffer(d);
          }
        );

    var loaded =
      Array.prototype
        .map
        .call(filesList, function(file) { return file.data.parsedData; })
        .filter(function(parsedData) { return parsedData; });
    loaded.forEach(function(parsedData) { parsedData.maxHeight = 0; });

    var studentContainers =
      output.selectAll('.studentContainer')
        .data(
          Array.prototype.concat.apply([], loaded),
          function(d) { return d.index + ' ' + d['class'].file.key; }
        );
    studentContainers.exit().remove();
    var studentContainersEnter = studentContainers.enter();
    var studentsEnter =
      studentContainersEnter.append('div')
          .classed('studentContainer', true)
          .each(
            function(d) {
              d.score = 0;
              d.total = 0;
              d.maxWidth = 0;
            }
          )
        .append('div')
          .classed('student', true);
    var students = studentContainers.select('.student');

    var studentHeaders =
      studentsEnter.append('div').classed('studentHeader', true);

    var names = studentHeaders.append('span');
    names.append('span')
        .classed('studentName', true)
        .html(function(d) { return d.name; });

    var className = names.append('span').classed('className', true);
    className.append('span').text('(');
    className.append('span').html(function(d) { return d['class'].name; });
    className.append('span').text(') ');

    studentHeaders.append('span').classed('date', true);
    students.select('.studentHeader').select('.date').html(date);

    var categories = studentsEnter.append('div')
      .selectAll('.category')
      .data(
        function(d) {
          var categories = d['class'].categories;
          var blank = categories.indexOf('');
          if (blank > -1) {
            categories = categories.slice();
            categories.splice(blank, 1);
            categories.unshift('');
          }
          return categories.map(
            function(category) { return d.assignments[category]; }
          );
        }
      )
      .enter()
      .append('div')
        .classed('category', true);
    categories.append('div')
      .classed('categoryName', true)
      .html(function(d) { return d.category; });

    function parseScore(score) {
      return (
        /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(score)
          ? parseFloat(score)
          : NaN
      );
    }

    if (!categories.empty()) {
      var textWidth = categories.node().getBoundingClientRect().width;
    }

    var assignments =
      categories.append('div')
          .classed('assignments', true)
        .selectAll('.assignment')
        .data(function(d) { return d; })
        .enter()
        .append('span')
          .classed('assignment', true)
          .classed(
            'ignored',
            function(d) { return isNaN(parseScore(d.score)); }
          );
    assignments.filter('.ignored')
        .each(function(d) { d.student.hasIgnoredScore = true; });
    assignments.filter('*:not(.ignored)')
        .each(
          function(d) {
            d.student.score += parseFloat(d.score);
            d.student.total += parseFloat(d.assignment.total);
          }
        );
    assignments.append('span')
      .classed('assignmentName', true)
      .html(function(d) { return d.assignment.name; });

    var scoreSpan = assignments.append('span');

    var scoreContents = scoreSpan.append('span');
    scoreContents.append('span').html(function(d) { return d.score; });
    scoreContents.filter('.ignored.assignment *').append('span').text('*');

    scoreSpan.append('span').classed('division', true).text('/');
    scoreSpan.append('span').html(function(d) { return d.assignment.total; });

    assignments.each(
      function(d) {
        if (d.student.maxWidth < this.getBoundingClientRect().width) {
          d.student.maxWidth = this.getBoundingClientRect().width;
        }
      }
    );
    studentsEnter.each(
      function(d) {
        if (textWidth) {
          d.density = Math.floor(textWidth / d.maxWidth);
        }
      }
    );
    assignments.classed(
      'endOfLine',
      function(d, i) { return !((i + 1) % d.student.density); }
    )
        .style(
          'width',
          function(d) {
            return textWidth / scale / d.student.density + 'rem';
          }
        );

    var totals = studentsEnter.append('div').classed('total', true);
    totals.append('span').classed('label', true).text('Total:');
    totals.append('span').text(function(d) { return d.score; });
    totals.append('span').classed('division', true).text('/');
    totals.append('span').text(function(d) { return d.total; });
    totals.append('span').classed('equals', true).text('=');
    totals.append('span').text(
      function(d) {
        return d.total ? (100 * d.score / d.total).toFixed(2) : 'undefined';
      }
    );
    totals.append('span').text('%');

    studentsEnter.filter(function(d) { return d.hasIgnoredScore; })
      .append('div')
        .classed('ignoredWarning', true)
        .text('*not included in current grade calculation');

    var commentsDiv =
      studentsEnter.filter(function(d) { return d.length; })
        .append('div')
        .classed('comments', true);
    commentsDiv.append('span')
        .classed('commentsLabel', true)
        .text('Comments:');
    commentsDiv.selectAll('span.comment')
      .data(function(d) { return d.slice(0, 1); })
      .enter()
      .append('span')
        .classed('comment', true)
        .html(function(d) { return d; });
    commentsDiv.selectAll('p.comment')
      .data(function(d) { return d.slice(1); })
      .append('p')
        .classed('comment', true)
        .html(function(d) { return d; });

    students.each(
      function(d) {
        if (d['class'].maxHeight < this.getBoundingClientRect().height) {
          d['class'].maxHeight = this.getBoundingClientRect().height;
        }
      }
    );
    loaded.forEach(
      function(parsedData) {
        parsedData.density =
          Math.floor(
            PAGE_HEIGHT / (parsedData.maxHeight / scale + 2 * VERTICAL_MARGIN));
      }
    );
    var classesByDensity = [];
    loaded.forEach(
      function(parsedData) {
        var density = parsedData.density;
        if (!classesByDensity[density]) {
          classesByDensity[density] = [];
          classesByDensity[density].studentCount = 0;
        }
        classesByDensity[density].push(parsedData);
        classesByDensity[density].studentCount += parsedData.length;
      }
    );

    for (i = classesByDensity.length - 1; i >= 0; i--) {
      if (classesByDensity[i]) {
        var studentCount = classesByDensity[i].studentCount;
        var nextStudentCount =
          classesByDensity[i - 1] ? classesByDensity[i - 1].studentCount : 0;
        if ((studentCount + nextStudentCount) / (i - 1)
          <= Math.ceil(studentCount / i) + Math.ceil(nextStudentCount / (i - 1))
        )
        {
          if (!classesByDensity[i - 1]) {
            classesByDensity[i - 1] = [];
            classesByDensity[i - 1].studentCount = 0;
          }
          Array.prototype
            .push
            .apply(classesByDensity[i - 1], classesByDensity[i]);
          classesByDensity[i - 1].studentCount +=
            classesByDensity[i].studentCount;
          delete classesByDensity[i];
        }
      }
    }

    var totalStudentCount = 0;
    classesByDensity.forEach(
      function(classes, i) {
        var pages = Math.ceil(classes.studentCount / i);
        var densityStudentCount = 0;
        classes.forEach(
          function(classArray) {
            classArray.density = i;
            classArray.forEach(
              function(student) {
                student.order = densityStudentCount + totalStudentCount;
                var index = densityStudentCount * i % (pages * i - 1);
                student.index = index + totalStudentCount;
                student.pageBreakBefore = student.index && !(index % i);
                densityStudentCount++;
              }
            );
          }
        );
        totalStudentCount += classes.studentCount;
      }
    );
    studentContainers
        .classed(
          'bottomOfPage',
          function(d) { return !((d.index + 1) % d['class'].density); }
        )
        .style(
          'height',
          function(d) {
            return (
              PAGE_HEIGHT / d['class'].density - VERTICAL_MARGIN * 2 + 'rem');
          }
        )
        .style('min-height', function() { return this.style.height; })
        .style('order', function(d) { return d.order; })
        .style(
          'page-break-before',
          function(d) { return d.pageBreakBefore ? 'always' : 'avoid'; }
        );
    studentContainers.sort(function(a, b) { return a.index - b.index; });
  }

  function setUp() {
    var input = d3.select('#input');
    var onFileChange =
      function() {
        filesList = d3.event.target.files;
        scheduleUpdateOutput();
      };
    filesList =
      input.select('#filesInput')
          .on('input', onFileChange)
          .on('change', onFileChange)
        .property('files');

    date =
      input.select('#dateInput')
          .attr('value', date)
          .on(
            'input',
            function() {
              date = d3.event.target.value;
              scheduleUpdateOutput();
            }
          )
        .property('value');
    input.style('display', null);

    scheduleUpdateOutput();
  }

  setUp();
}();