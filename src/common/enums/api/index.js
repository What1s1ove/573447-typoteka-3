'use strict';

const {HttpCode} = require(`./http-code.enum`);
const {ApiPath} = require(`./api-path.enum`);
const {SearchApiPath} = require(`./search-api-path.enum`);
const {CategoryApiPath} = require(`./category-api-path.enum`);
const {ArticlesApiPath} = require(`./articles-api-path.enum`);
const {HttpMethod} = require(`./http-method.enum`);
const {SuccessHTTPStatusRange} = require(`./success-http-status-range.enum`);

module.exports = {
  HttpCode,
  ApiPath,
  SearchApiPath,
  CategoryApiPath,
  ArticlesApiPath,
  HttpMethod,
  SuccessHTTPStatusRange,
};
