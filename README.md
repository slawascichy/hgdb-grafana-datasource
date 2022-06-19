# MercuryDB 3.0 (Hgdb) Grafana Data Source Plugin

[![Build](https://github.com/slawascichy/hgdb-grafana-datasource/workflows/CI/badge.svg)](https://github.com/slawascichy/hgdb-grafana-datasource/actions?query=workflow%3A%22CI%22)

This is [MercuryDB 3.0 (Hgdb)](https://hgdb.org) Grafana Data Source Plugin

## What is Grafana Data Source Plugin?

Grafana supports a wide range of data sources, including Prometheus, MySQL, and even Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana Data Source Plugins enables integrating such solutions with Grafana.

## Before you start

You need to prepare a development environment. Install yourself:
* [Visual Studio Code](https://code.visualstudio.com/)
* [Node.js(R)](https://nodejs.org/en/download/)

## Getting started

1. Install dependencies

   ```bash
   yarn install
   npm i @grafana/runtime
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Learn more

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
