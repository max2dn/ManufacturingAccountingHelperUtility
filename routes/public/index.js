const express = require('express')
const public = express.Router()
const path = require('path')

public.use('/stylesheets', express.static(path.resolve('public/stylesheets')));
public.use('/scripts', express.static(path.resolve('public/scripts')));
public.use('/images',  express.static(path.resolve('public/images')));
public.use('/modules', express.static(path.resolve('public/html')));

console.log(path.resolve('public/html'))

module.exports = public;