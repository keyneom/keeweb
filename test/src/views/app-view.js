import { expect } from 'chai';
import { AppView } from 'views/app-view';
import { Locale } from 'util/locale';

describe('AppView', () => {
    describe('saveAndLock()', () => {
        it('syncs modified-only files before closing', (done) => {
            const synced = [];
            const fakeFile1 = { modified: false, dirty: true, name: 'dirty-file' };
            const fakeFile2 = { modified: true, dirty: false, name: 'modified-file' };
            const files = {
                forEach(callback, ctx) {
                    [fakeFile1, fakeFile2].forEach((file) => callback.call(ctx, file));
                }
            };
            let closed = false;
            const fakeView = {
                model: {
                    files,
                    syncFile(file, _opts, callback) {
                        synced.push(file.name);
                        callback(null);
                    }
                },
                closeAllFilesAndShowFirst() {
                    closed = true;
                }
            };

            AppView.prototype.saveAndLock.call(fakeView, (result) => {
                expect(result).to.be.true;
                expect(synced).to.include('dirty-file');
                expect(synced).to.include('modified-file');
                expect(closed).to.be.true;
                done();
            });
        });
    });

    describe('beforeUnload()', () => {
        it('warns when there are modified-only files', () => {
            const fakeView = {
                model: {
                    files: {
                        hasDirtyFiles() {
                            return false;
                        },
                        hasUnsavedFiles() {
                            return true;
                        }
                    },
                    settings: {
                        autoSave: false,
                        minimizeOnClose: false
                    }
                },
                exitAlertShown: false
            };

            const result = AppView.prototype.beforeUnload.call(fakeView, {});
            expect(result).to.equal(Locale.appUnsavedWarnBody);
        });

        it('does not warn when there are no modified or dirty files', () => {
            const fakeView = {
                model: {
                    files: {
                        hasDirtyFiles() {
                            return false;
                        },
                        hasUnsavedFiles() {
                            return false;
                        }
                    },
                    settings: {
                        autoSave: false,
                        minimizeOnClose: false
                    }
                },
                exitAlertShown: false
            };

            const result = AppView.prototype.beforeUnload.call(fakeView, {});
            expect(result).to.be.undefined;
        });
    });
});
