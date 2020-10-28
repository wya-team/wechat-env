/**
 * 用于编译不同分支下自动替换appid
 * 如果是第三方发布，需要配置project
 * 如果不包含第三方发布，请删除ext部分，同时也不要生成文件
 * 
 * 在package.json修改scripts，"dev": "cross-env BRANCH=develop node ./enforce.pre.js && ......"
 */
const fs = require('fs-extra');
const { merge } = require('lodash');

let { project, ext } = ({
	develop: {
		project: {
			appid: 'wx46cfa9a879cf9dcd',
		},
		ext: {
			extEnable: true,
			extAppid: "wxb5f3db65b19661f7",
			ext: {
				"merchant_id": 172
			}
		}
	},
	'pre-release': {
		project: {
			appid: 'wx944b4ba78dbe2261',
		},
		ext: {
			extEnable: true,
			extAppid: "wxe2f73677422e8be5",
			ext: {
				"merchant_id": 203
			}
		}
	},
	master: {
		project: {
			appid: 'wxeab3ed81664f0774',
		},
		ext: {
			extEnable: true,
			extAppid: "wx3a1378ca03d8f943",
			ext: {
				"merchant_id": 193
			}
		}
	}
})[process.env.BRANCH];

project = merge(require('./project.config.json'), project);
ext = merge(require('./src/ext.json'), ext);

fs.outputFileSync('./project.config.json', JSON.stringify(project, null, 2));
fs.outputFileSync('./src/ext.json', JSON.stringify(ext, null, 2));
