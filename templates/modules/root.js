const { resolve } = require('path');
const fs = require('fs-extra');
const aOne = require('./a-one');
const aTwo = require('./a-two');
const master = require('./master');

module.exports = [
	...aOne,
	...aTwo,
	...master
].map(i => {
	i.platform = 'wx';
	return i;
});