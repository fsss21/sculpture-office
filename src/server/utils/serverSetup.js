const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

/**
 * Конфигурация сервера — проект «Кабинет скульптора» (sculptors-office)
 * React + Vite, данные: catalog.json в public/data/
 */
const CONFIG = {
  // Порт сервера (не конфликтует с Vite dev 5173)
  port: 3001,

  // Режим kiosk (полноэкранный режим)
  kioskMode: false,

  // Автоматически открывать браузер при запуске
  openBrowser: true,

  // Отключить проверку CORS в браузере (только для локальной разработки)
  disableWebSecurity: true,

  // Задержка перед открытием браузера (мс)
  browserDelay: 1000,

  // Путь к index.html (сборка Vite → build/)
  indexHtmlPath: 'index.html',

  // Файл данных каталога (относительно public/ или build/)
  catalogFile: path.join('data', 'catalog.json'),
  // Файл для совместимости с API сервера (если нужна статистика — можно использовать)
  statisticsFile: path.join('data', 'statistics.json'),
};

/**
 * Класс для управления настройками и запуском сервера
 * Поддерживает как обычный запуск через node, так и сборку через pkg
 */
class ServerSetup {
  constructor() {
    try {
      // __dirname = src/server/utils → вверх 3 уровня = корень проекта
      this.isPkg = typeof process.pkg !== 'undefined';
      this.baseDir = this.isPkg ? path.dirname(process.execPath) : path.join(__dirname, '..', '..', '..');

      this.config = {
        port: CONFIG.port,
        kioskMode: CONFIG.kioskMode,
        openBrowser: CONFIG.openBrowser,
        disableWebSecurity: CONFIG.disableWebSecurity,
        browserDelay: CONFIG.browserDelay,
        indexHtmlPath: CONFIG.indexHtmlPath,
        catalogFile: CONFIG.catalogFile,
        statisticsFile: CONFIG.statisticsFile,
      };

      // Для совместимости с index.js: gameItemsFile = catalog
      this.config.gameItemsFile = this.config.catalogFile;

      // Директория со сборкой: Vite → build/ (vite.config.js: build.outDir: 'build')
      if (this.isPkg) {
        this.buildDir = this.baseDir;
      } else {
        this.buildDir = path.join(this.baseDir, 'build');
      }

      // Пути к файлам данных
      if (this.isPkg) {
        this.gameItemsFile = path.join(this.baseDir, this.config.gameItemsFile);
        this.statisticsFile = path.join(this.baseDir, this.config.statisticsFile);
        this.gameItemsFileFallback = null;
        this.statisticsFileFallback = null;
      } else {
        const buildCatalogPath = path.join(this.buildDir, this.config.catalogFile);
        const publicCatalogPath = path.join(this.baseDir, 'public', this.config.catalogFile);
        const buildStatsPath = path.join(this.buildDir, this.config.statisticsFile);
        const publicStatsPath = path.join(this.baseDir, 'public', this.config.statisticsFile);

        this.gameItemsFile = buildCatalogPath;
        this.gameItemsFileFallback = publicCatalogPath;
        this.statisticsFile = buildStatsPath;
        this.statisticsFileFallback = publicStatsPath;
      }

      this.tinderVotesFile = null;

      this.getGameItemsFile = this.getGameItemsFile.bind(this);
      this.getStatisticsFile = this.getStatisticsFile.bind(this);
      this.getTinderVotesFile = this.getTinderVotesFile.bind(this);
    } catch (error) {
      console.error('❌ Ошибка в конструкторе ServerSetup:', error);
      throw error;
    }
  }

  getBaseDir() {
    return this.baseDir;
  }

  getBuildDir() {
    return this.buildDir;
  }

  /**
   * Путь к catalog.json (для совместимости с index.js как gameItemsFile)
   */
  async getGameItemsFile() {
    try {
      if (this.isPkg) return this.gameItemsFile;
      if (typeof fs.pathExists !== 'function') return this.gameItemsFile;
      const buildExists = await fs.pathExists(this.gameItemsFile);
      if (buildExists) return this.gameItemsFile;
      if (this.gameItemsFileFallback) {
        const publicExists = await fs.pathExists(this.gameItemsFileFallback);
        if (publicExists) return this.gameItemsFileFallback;
      }
      return this.gameItemsFile;
    } catch (error) {
      console.error('❌ Ошибка в getGameItemsFile:', error);
      throw error;
    }
  }

  /**
   * Путь к statistics.json (опционально для API)
   */
  async getStatisticsFile() {
    try {
      if (this.isPkg) return this.statisticsFile;
      if (typeof fs.pathExists !== 'function') return this.statisticsFile;
      const buildExists = await fs.pathExists(this.statisticsFile);
      if (buildExists) return this.statisticsFile;
      if (this.statisticsFileFallback) {
        const publicExists = await fs.pathExists(this.statisticsFileFallback);
        if (publicExists) return this.statisticsFileFallback;
      }
      return this.statisticsFile;
    } catch (error) {
      console.error('❌ Ошибка в getStatisticsFile:', error);
      throw error;
    }
  }

  async getTinderVotesFile() {
    return Promise.resolve(this.tinderVotesFile);
  }

  isPkgMode() {
    return this.isPkg;
  }

  getAppUrl() {
    return `http://localhost:${this.config.port}`;
  }

  getApiUrl() {
    return `http://localhost:${this.config.port}/api`;
  }

  async checkIndexHtml() {
    try {
      const indexHtmlPath = path.join(this.buildDir, this.config.indexHtmlPath);
      const exists = await fs.pathExists(indexHtmlPath);

      if (!exists) {
        console.error(`\n❌ ОШИБКА: файл ${this.config.indexHtmlPath} не найден: ${indexHtmlPath}`);
        console.log(`\n📂 Выполните сборку: npm run build`);
        console.log(`   BUILD_DIR: ${this.buildDir}`);
        console.log(`   baseDir: ${this.baseDir}`);
      } else {
        console.log(`✅ ${this.config.indexHtmlPath} найден: ${indexHtmlPath}`);
      }

      return exists;
    } catch (error) {
      console.error('❌ Ошибка при проверке index.html:', error);
      return false;
    }
  }

  async openBrowser() {
    if (!this.config.openBrowser) return;

    if (os.platform() !== 'win32') {
      console.log('⚠️  Автооткрытие браузера поддерживается только на Windows');
      console.log(`🌐 Откройте вручную: ${this.getAppUrl()}`);
      return;
    }

    const url = this.getAppUrl();
    if (this.config.disableWebSecurity) {
      console.log('⚠️  CORS отключена в браузере (только для разработки).');
    }

    const chromePath = (process.env.PROGRAMFILES || 'C:\\Program Files') + '\\Google\\Chrome\\Application\\chrome.exe';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || process.env.PROGRAMFILES || 'C:\\Program Files (x86)';
    const edgePath = path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe');

    const chromeExists = await fs.pathExists(chromePath);
    if (chromeExists) {
      let chromeFlags = '';
      if (this.config.disableWebSecurity) {
        chromeFlags += `--disable-web-security --user-data-dir="${os.tmpdir()}\\ChromeTempProfile" `;
      }
      if (this.config.kioskMode) {
        chromeFlags += `--autoplay-policy=no-user-gesture-required --app="${url}" --start-fullscreen --kiosk`;
      } else {
        chromeFlags += `--app="${url}" --auto-open-devtools-for-tabs`;
      }
      exec(`"${chromePath}" ${chromeFlags}`, (error) => {
        if (error) console.error('❌ Ошибка открытия Chrome:', error);
      });
      if (this.config.kioskMode) {
        setTimeout(() => {
          exec('taskkill /f /im explorer.exe', (error) => {
            if (error && !error.message.includes('не найден')) console.error('⚠️ ', error.message);
          });
        }, 12000);
      }
      return;
    }

    if (await fs.pathExists(edgePath)) {
      let edgeFlags = this.config.disableWebSecurity
        ? `--disable-web-security --user-data-dir="${os.tmpdir()}\\EdgeTempProfile" `
        : '';
      edgeFlags += this.config.kioskMode ? `--kiosk "${url}"` : `"${url}"`;
      exec(`"${edgePath}" ${edgeFlags}`, (error) => {
        if (error) console.error('❌ Ошибка открытия Edge:', error);
      });
    } else {
      console.log(`🌐 Откройте браузер вручную: ${url}`);
    }
  }

  async initializeDataDir() {
    try {
      const catalogPath = await this.getGameItemsFile();
      const statisticsPath = await this.getStatisticsFile();

      await fs.ensureDir(path.dirname(catalogPath));
      await fs.ensureDir(path.dirname(statisticsPath));

      const catalogExists = await fs.pathExists(catalogPath);
      const statisticsExists = await fs.pathExists(statisticsPath);

      console.log(`📂 catalog.json: ${catalogPath} (${catalogExists ? 'найден' : 'не найден'})`);
      console.log(`📂 statistics.json: ${statisticsPath} (${statisticsExists ? 'найден' : 'будет создан при необходимости'})`);

      if (!statisticsExists) {
        await fs.writeJson(statisticsPath, [], { spaces: 2 });
        console.log('✅ Файл statistics.json создан (пустой массив).');
      }

      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации данных:', error);
      return false;
    }
  }

  logServerInfo() {
    console.log(`🚀 Сервер «Кабинет скульптора» (sculptors-office) на порту ${this.config.port}`);
    console.log(`📁 Каталог: ${this.gameItemsFile}`);
    console.log(`📂 Статика: ${this.buildDir}`);
    console.log(`🌐 Приложение: ${this.getAppUrl()}`);
    console.log(`🔧 Kiosk: ${this.config.kioskMode ? 'вкл' : 'выкл'}`);
    if (this.config.openBrowser) console.log(`🌐 Автооткрытие браузера: вкл`);
  }

  setupStaticFiles(app, express) {
    app.use(express.static(this.buildDir));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(this.buildDir, this.config.indexHtmlPath));
    });
  }

  async startServer(app, onReady) {
    try {
      const indexExists = await this.checkIndexHtml();
      if (!indexExists) {
        throw new Error(`index.html не найден в ${this.buildDir}. Выполните: npm run build`);
      }

      app.listen(this.config.port, async () => {
        try {
          this.logServerInfo();
          if (onReady) await onReady();
          if (this.config.openBrowser) {
            setTimeout(async () => {
              try {
                await this.openBrowser();
              } catch (error) {
                console.error('❌ Ошибка открытия браузера:', error);
                console.log(`🌐 Откройте вручную: ${this.getAppUrl()}`);
              }
            }, this.config.browserDelay);
          }
        } catch (error) {
          console.error('❌ Ошибка после запуска:', error);
          throw error;
        }
      }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`\n❌ Порт ${this.config.port} занят. Закройте другое приложение или измените порт.`);
        } else {
          console.error('\n❌ Ошибка запуска:', error.message);
        }
        console.log('\n⚠️  Окно закроется через 30 секунд...');
        setTimeout(() => process.exit(1), 30000);
      });
    } catch (error) {
      console.error('❌ Ошибка в startServer:', error);
      throw error;
    }
  }
}

module.exports = ServerSetup;
