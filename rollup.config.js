import resolve from 'rollup-plugin-node-resolve';

// Add here external dependencies that actually you use.
const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    'rxjs/Observable': 'Rx',
    'rxjs/Observer': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/add/operator/map': 'Rx',
    'localforage': 'LocalForage'
};

export default {
    entry: './dist/modules/smartenit-angular-sdk.es5.js',
    dest: './dist/bundles/smartenit-angular-sdk.umd.js',
    format: 'umd',
    exports: 'named',
    moduleName: 'ng.smartenitAngularSDK',
    plugins: [resolve()],
    external: Object.keys(globals),
    globals: globals,
    onwarn: () => { return }
}
