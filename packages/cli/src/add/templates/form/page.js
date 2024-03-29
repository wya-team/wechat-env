exports.page = (content, opts = {}) => {
	const { isSubPackage, platform, mutation, pathArr, project, packageName, obj, title } = opts;
	try {
		let contents = '';

		contents += `<template>\n`;
		contents += `	<mc-form\n`;
		contents += `		border\n`;
		contents += `		model="{{formValidate}}"\n`;
		contents += `		rules="{{ruleValidate}}"\n`;
		contents += `		label-width="{{180}}"\n`;
		contents += `		label-position="left"\n`;
		contents += `		bind:ready="handleReady"\n`;
		contents += `	>\n`;
		contents += `		<mc-form-item label="输入框" prop="input">\n`;
		contents += `			<mc-input right value="{{formValidate.input}}" bind:change="handleChange" />\n`;
		contents += `		</mc-form-item>\n`;
		contents += `		<mc-form-item label="选择器" prop="array">\n`;
		contents += `			<mc-picker\n`;
		contents += `				dataSource="{{dataSource}}"\n`; 
		contents += `				value="{{formValidate.array}}"\n`; 
		contents += `				bind:change="handleSelect"\n`;
		contents += `			/>\n`;
		contents += `		</mc-form-item>\n`;
		contents += `	</mc-form>\n`;
		contents += `	<view bind:tap="handleSubmit">提交</view>\n`;
		contents += `</template>\n\n`;

		contents += `<script>\n`;

		contents += `import Mol from '@wya/mol';\n`;
		if (packageName !== 'pages') { 
			contents += `import '../../index';\n`;
		}

		contents += `\nMol.page({\n`;
		contents += `	data: {\n`;
		contents += `		dataSource: [\n`;
		contents += `			{ \n`;
		contents += `				label: '男',\n`;
		contents += `				value: 1,\n`;
		contents += `				children: [\n`;
		contents += `					{\n`;
		contents += `						label: '爱好女',\n`;
		contents += `						value: '2'\n`;
		contents += `					},\n`;
		contents += `					{\n`;
		contents += `						label: '爱吹牛',\n`;
		contents += `						value: '3'\n`;
		contents += `					}\n`;
		contents += `				]\n`;
		contents += `			},\n`;
		contents += `			{ \n`;
		contents += `				label: '女',\n`;
		contents += `				value: 2,\n`;
		contents += `				children: [\n`;
		contents += `					{\n`;
		contents += `						label: '爱好男',\n`;
		contents += `						value: '5'\n`;
		contents += `					},\n`;
		contents += `					{\n`;
		contents += `						label: '爱哔哔',\n`;
		contents += `						value: '4'\n`;
		contents += `					}\n`;
		contents += `				] \n`;
		contents += `			}\n`;
		contents += `		],\n`;
		contents += `		formValidate: {\n`;
		contents += `			input: '',\n`;
		contents += `			array: [],\n`;
		contents += `		},\n`;
		contents += `		ruleValidate: {\n`;
		contents += `			input: [\n`;
		contents += `				{\n`;
		contents += `					required: true,\n`;
		contents += `					name: '~~input项~~'\n`;
		contents += `				}\n`;
		contents += `			],\n`;
		contents += `			array: [\n`;
		contents += `				{\n`;
		contents += `					required: true,\n`;
		contents += `					name: '~~array项~~'\n`;
		contents += `				}\n`;
		contents += `			],\n`;
		contents += `		}\n`;
		contents += `	},\n`;
		contents += `	onShow() {\n`;
		contents += `	},\n`;
		contents += `	onLoad(options) {\n`;
		contents += `	},\n`;
		contents += `	handleReady(event) {\n`;
		contents += `		this.form = event.detail;\n`;
		contents += `	},\n`;
		contents += `	handleChange(event) {\n`;
		contents += `		this.setData({\n`;
		contents += `			'formValidate.input': event.detail\n`;
		contents += `		});\n`;
		contents += `	},\n`;
		contents += `	handleSelect(event) {\n`;
		contents += `		this.setData({\n`;
		contents += `			'formValidate.array': event.detail.value\n`;
		contents += `		});\n`;
		contents += `	},\n`;
		contents += `	async handleSubmit() {\n`;
		contents += `		try {\n`;
		contents += `			await this.form.validate();\n`;
		contents += `			${platform}.showToast({ title: '校验通过' });\n`;
		contents += `		} catch (e) {\n`;
		contents += `			console.log(e);\n`;
		contents += `		}\n`;
		contents += `	},\n`;
		contents += `});\n`;
		contents += `</script>\n\n`;
		contents += `<style lang="scss">\n`;
		contents += `</style>\n\n`;
		contents += `<config>\n`;
		contents += `{\n`;
		contents += `	"navigationBarTitleText": "${title}",\n`;
		contents += `	"usingComponents": {\n`;
		// 字节还不支持全局注册
		if (platform === 'tt') {
			let patchPath = isSubPackage ? '../' : '';
			contents += `		"mc-form": "../../${patchPath}libs/mc/form/index",\n`;
			contents += `		"mc-form-item": "../../${patchPath}libs/mc/form/form-item",\n`;
			contents += `		"mc-input": "../../${patchPath}libs/mc/input/index",\n`;
			contents += `		"mc-picker": "../../${patchPath}libs/mc/picker/index"\n`;
		}
		contents += `	}\n`;
		contents += `}\n`;
		contents += `</config>\n`;
		return contents;
	} catch (e) {
		console.log(e);
		return content;
	}
};