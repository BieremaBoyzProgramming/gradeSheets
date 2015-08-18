/**
 * Created: 2015-06-13
 * Author: Bierema Boyz Publishing
 * Copyright (c) 2015 Bierema Boyz Publishing. All rights reserved.
 * @license MIT
 */
window.onerror=function(e,t,n){alert("Fatal error: "+t+":"+n+": "+e)},!function(){function e(){try{return new Worker("lib/parseDSV.js")}catch(e){return d=d||URL.createObjectURL(new Blob(["("+bieremaBoyz.gradeSheets.parseDSV+").call(self);"])),new Worker(d)}}function t(){u||(u=!0,setTimeout(n,0))}function n(){function n(e){return/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(e)?parseFloat(e):NaN}var a;u=!1;var d=d3.selectAll("#output"),p=d.select("#scaleDiv").node().getBoundingClientRect().width/816,f={};Array.prototype.forEach.call(l,function(e){e.key=e.lastModifiedDate.valueOf()+e.name,f[e.key]=!0,i.hasOwnProperty(e.key)?e.data=i[e.key]:(e.data={},i[e.key]=e.data)});var h;for(h in i)i.hasOwnProperty(h)&&!f.hasOwnProperty(h)&&delete i[h];var g=d.selectAll(".error").data(Array.prototype.filter.call(l,function(e){return e.data.error}),function(e){return e.key});g.exit().remove();var m=g.enter().insert("p",".loading,.studentContainer").classed("error",!0);m.append("span").html(function(e){return e.data.error.beginning}),m.append("span").text(function(e){return e.name}),m.append("span").html(function(e){return e.data.error.end});var y=d.selectAll(".loading").data(Array.prototype.filter.call(l,function(e){return!(e.data.error||e.data.parsedData)}),function(e){return e.key});y.exit().each(function(e){e.data.reader&&(e.data.reader.abort(),delete e.data.reader),e.data.worker&&(e.data.worker.abort(),delete e.data.worker)}).remove(),y.enter().insert("p",".studentContainer").classed("loading",!0).text(function(e){return"Loading "+e.name+"…"}).each(function(n){n.data.reader=new FileReader,n.data.reader.onerror=function(){n.data.error={beginning:"Error reading file ",end:": "+n.data.reader.error},delete n.data.reader,t()},n.data.reader.onload=function(a){delete n.data.reader;var r=c.pop()||e();c.length||c.push(e()),r.onmessage=function(e){e.data.error?n.data.error=e.data.error:n.data.parsedData=e.data,c.push(n.data.worker),delete n.data.worker,t()},r.onerror=function(e){n.data.error={beginning:"Unexpected error while parsing file ",end:": "+e.filename+":"+e.lineno+": "+e.message},delete n.data.worker,t(),e.preventDefault()},r.postMessage({file:n}),r.postMessage(a.target.result)},n.data.reader.readAsArrayBuffer(n)});var v=Array.prototype.map.call(l,function(e){return e.data.parsedData}).filter(function(e){return e});v.forEach(function(e){e.maxHeight=0});var x=d.selectAll(".studentContainer").data(Array.prototype.concat.apply([],v),function(e){return e.index+" "+e.class.file.key});x.exit().remove();var w=x.enter(),C=w.append("div").classed("studentContainer",!0).each(function(e){e.score=0,e.total=0,e.maxWidth=0}).append("div").classed("student",!0),k=x.select(".student"),b=C.append("div").classed("studentHeader",!0),A=b.append("span");A.append("span").classed("studentName",!0).html(function(e){return e.name});var B=A.append("span").classed("className",!0);B.append("span").text("("),B.append("span").html(function(e){return e.class.name}),B.append("span").text(") "),b.append("span").classed("date",!0),k.select(".studentHeader").select(".date").html(o);var D=C.append("div").selectAll(".category").data(function(e){var t=e.class.categories,n=t.indexOf("");return n>-1&&(t=t.slice(),t.splice(n,1),t.unshift("")),t.map(function(t){return e.assignments[t]})}).enter().append("div").classed("category",!0);if(D.append("div").classed("categoryName",!0).html(function(e){return e.category}),!D.empty())var R=D.node().getBoundingClientRect().width;var E=D.append("div").classed("assignments",!0).selectAll(".assignment").data(function(e){return e}).enter().append("span").classed("assignment",!0).classed("ignored",function(e){return isNaN(n(e.score))});E.filter(".ignored").each(function(e){e.student.hasIgnoredScore=!0}),E.filter("*:not(.ignored)").each(function(e){e.student.score+=parseFloat(e.score),e.student.total+=parseFloat(e.assignment.total)}),E.append("span").classed("assignmentName",!0).html(function(e){return e.assignment.name});var M=E.append("span"),N=M.append("span");N.append("span").html(function(e){return e.score}),N.filter(".ignored.assignment *").append("span").text("*"),M.append("span").classed("division",!0).text("/"),M.append("span").html(function(e){return e.assignment.total}),E.each(function(e){e.student.maxWidth<this.getBoundingClientRect().width&&(e.student.maxWidth=this.getBoundingClientRect().width)}),C.each(function(e){R&&(e.density=Math.floor(R/e.maxWidth))}),E.classed("endOfLine",function(e,t){return!((t+1)%e.student.density)}).style("width",function(e){return R/p/e.student.density+"rem"});var O=C.append("div").classed("total",!0);O.append("span").classed("label",!0).text("Total:"),O.append("span").text(function(e){return e.score}),O.append("span").classed("division",!0).text("/"),O.append("span").text(function(e){return e.total}),O.append("span").classed("equals",!0).text("="),O.append("span").text(function(e){return e.total?(100*e.score/e.total).toFixed(2):"undefined"}),O.append("span").text("%"),C.filter(function(e){return e.hasIgnoredScore}).append("div").classed("ignoredWarning",!0).text("*not included in current grade calculation");var W=C.filter(function(e){return e.length}).append("div").classed("comments",!0);W.append("span").classed("commentsLabel",!0).text("Comments:"),W.selectAll("span.comment").data(function(e){return e.slice(0,1)}).enter().append("span").classed("comment",!0).html(function(e){return e}),W.selectAll("p.comment").data(function(e){return e.slice(1)}).append("p").classed("comment",!0).html(function(e){return e}),k.each(function(e){e.class.maxHeight<this.getBoundingClientRect().height&&(e.class.maxHeight=this.getBoundingClientRect().height)}),v.forEach(function(e){e.density=Math.floor(r/(e.maxHeight/p+2*s))});var F=[];for(v.forEach(function(e){var t=e.density;F[t]||(F[t]=[],F[t].studentCount=0),F[t].push(e),F[t].studentCount+=e.length}),a=F.length-1;a>=0;a--)if(F[a]){var H=F[a].studentCount,I=F[a-1]?F[a-1].studentCount:0;(H+I)/(a-1)<=Math.ceil(H/a)+Math.ceil(I/(a-1))&&(F[a-1]||(F[a-1]=[],F[a-1].studentCount=0),Array.prototype.push.apply(F[a-1],F[a]),F[a-1].studentCount+=F[a].studentCount,delete F[a])}var S=0;F.forEach(function(e,t){var n=Math.ceil(e.studentCount/t),a=0;e.forEach(function(e){e.density=t,e.forEach(function(e){e.order=a+S;var r=a*t%(n*t-1);e.index=r+S,e.pageBreakBefore=e.index&&!(r%t),a++})}),S+=e.studentCount}),x.classed("bottomOfPage",function(e){return!((e.index+1)%e.class.density)}).style("height",function(e){return r/e.class.density-2*s+"rem"}).style("min-height",function(){return this.style.height}).style("order",function(e){return e.order}).style("page-break-before",function(e){return e.pageBreakBefore?"always":"avoid"}),x.sort(function(e,t){return e.index-t.index})}function a(){var e=d3.select("#input"),n=function(){l=d3.event.target.files,t()};l=e.select("#filesInput").on("input",n).on("change",n).property("files"),e.select("#dateInput").attr("value",o).on("change",function(){o=d3.event.target.value,t()}),e.style("display",null),t()}var r=1056,s=24;window.d3||alert("The d3 library did not successfully load. Is the d3.min.js file located in the lib folder that is in the same folder as gradeSheets.js?");var d,o=d3.time.format("%Y-%m-%d")(new Date),i={},l=[],c=[e()],u=!1;a()}();
//# sourceMappingURL=../../build/gradeSheets.js.map