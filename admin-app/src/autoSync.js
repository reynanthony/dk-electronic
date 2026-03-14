/**
 * AutoSync - Automatic Git synchronization for admin panel
 * Automatically commits and pushes changes to GitHub after export
 */

const simpleGit = require('simple-git');
const path = require('path');
const log = require('electron-log');

class AutoSync {
    constructor(projectRoot) {
        this.git = simpleGit(projectRoot);
        this.projectRoot = projectRoot;
        this.isSyncing = false;
    }

    async sync() {
        if (this.isSyncing) {
            log.info('AutoSync: Ya hay una sincronización en progreso');
            return { success: false, message: 'Sincronización en progreso' };
        }

        this.isSyncing = true;

        try {
            log.info('AutoSync: Verificando cambios...');

            // Get status
            const status = await this.git.status();
            
            if (status.files.length === 0) {
                log.info('AutoSync: No hay cambios para sincronizar');
                return { success: true, message: 'No hay cambios' };
            }

            log.info('AutoSync: Archivos modificados:', status.files.map(f => f.path).join(', '));

            // Stage all changes
            await this.git.add('.');
            
            // Create commit with timestamp
            const timestamp = new Date().toLocaleString('es-DO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            const message = `Actualización automática - ${timestamp}`;
            
            await this.git.commit(message);
            log.info('AutoSync: Commit realizado');

            // Push to remote
            await this.git.push();
            log.info('AutoSync: push completado');

            return { success: true, message: 'Sincronizado con GitHub' };

        } catch (error) {
            log.error('AutoSync: Error:', error.message);
            return { success: false, message: error.message };
        } finally {
            this.isSyncing = false;
        }
    }

    async pull() {
        try {
            await this.git.pull();
            log.info('AutoSync: pull completado');
            return { success: true };
        } catch (error) {
            log.error('AutoSync: Error en pull:', error.message);
            return { success: false, message: error.message };
        }
    }
}

module.exports = AutoSync;
