import webpack from "webpack-stream";
import named from "vinyl-named";
import TerserPlugin from 'terser-webpack-plugin';

export const js = () => {
    return app.gulp.src(app.path.src.js)
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: 'JS',
                message: 'Error: <%= error.message %>'
            })
        ))
        .pipe(named())
        .pipe(webpack({
            mode: app.isProd ? 'production' : 'development',
            target: ['web', 'es2015'],
            optimization: {
                minimize: true,
                minimizer: [new TerserPlugin()],
            },
            output: {
                filename: 'scripts.min.js',
            },
            devtool: app.isProd ? false : 'source-map',
        }))
        .pipe(app.gulp.dest(app.path.build.js))
}