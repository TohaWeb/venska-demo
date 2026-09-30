import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import gcmq from 'gulp-group-css-media-queries';

const sass = gulpSass(dartSass);

export const scss = () => {
    return app.gulp.src(['src/scss/*.scss', '!src/scss/_*.scss']) // <-- тут
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: 'SCSS',
                message: 'Error: <%= error.message %>'
            })
        ))
        .pipe(
            app.plugins.if(
                app.isDev,
                sourcemaps.init()
            )
        )
        .pipe(gcmq())
        .pipe(autoprefixer({
            grid: true,
            flexbox: true,
            overrideBrowserslist: ['last 3 versions']
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(
            app.plugins.if(
                app.isDev,
                sourcemaps.write('./')
            )
        )
        .pipe(app.gulp.dest(app.path.build.css))
}