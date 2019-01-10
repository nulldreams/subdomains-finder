var ProgressBar = require('ascii-progress');
let test = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

var bar = new ProgressBar({
    schema: ':bar',
    total : test.length
});

// var iv = setInterval(function () {
//   bar.tick();
//   if (bar.completed) {
//     clearInterval(iv);
//   }
// }, 100);

for (let t of test) {
    bar.tick()
}