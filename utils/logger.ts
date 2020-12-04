import * as chalk from 'chalk';

import * as config from '../config';

export function log(...args: any[]) {
  console.log(chalk.green.bold('➜ '), ...args);
}

export function info(...args: any[]) {
  console.log(chalk.yellow.bold('➜ '), ...args);
}

export function warn(...args: any[]) {
  console.log(chalk.yellow.bold('✗ '), ...args);
}

export function error(...args: any[]) {
  console.log(chalk.red.bold('✗ '), ...args);
}

export function debug(...args: any[]) {
  if (!config.debug) return;
  console.log(chalk.cyan.bold('➜ '), ...args);
}

export default {
  log,
  info,
  warn,
  error,
  debug
};
