import gulp from 'gulp';
import {path} from "./gulp/config/path.js";
import {reset} from "./gulp/tasks/reset.js";
import {plugins} from "./gulp/config/plugins.js";
import {scss} from "./gulp/tasks/scss.js";
import {js} from "./gulp/tasks/js.js";
import {html} from "./gulp/tasks/html.js";

global.app = {
    isProd: process.argv.includes('--prod'),
    isDev: !process.argv.includes('--prod'),
    gulp:gulp,
    path:path,
    plugins:plugins
}
const mainTasks = gulp.parallel(scss, js, html);

let watcher = () => {
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.scss, scss);
    gulp.watch(path.watch.js, js);
}

const dev = gulp.series(reset, mainTasks, watcher);
const prod = gulp.series(reset, mainTasks);

export {dev};
export {prod};

gulp.task('default', dev);