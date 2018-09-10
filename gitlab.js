/**
 * Copyright (c) 2017 Kota Suizu
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 **/

module.exports = function(RED) {
	'use strict';
	const GitLabProjects = require('gitlab').ProjectsBundle;
	function createClient(node) {
		const client = new GitLabProjects({
			url: node.gitlabConfig.url,
			token: node.gitlabConfig.key
		});
		return client;
	}

	function processResult(result, node, msg) {
		return result
			.then(body => {
				msg.payload = body;
				node.send(msg);
				node.log(RED._('Succeeded to API Call.'));
			})
			.catch(function(error, body) {
				var myErr = {
					inputMessage: msg,
					error: error
				};
				console.log(myErr);
				node.error('Failed to API Call. ' + error, myErr);
			});
	}

	/**
	 * GitLab API Config
	 **/
	class GitlabConfig {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.key = n.key;
			this.url = n.url;
			this.project_id = n.project_id;
			var credentials = this.credentials;
			if (credentials && credentials.hasOwnProperty('key')) {
				this.key = credentials.key;
			}
		}
	}
	RED.nodes.registerType('gitlab-config', GitlabConfig, {
		credentials: {
			key: {
				type: 'password'
			}
		}
	});

	// === Issues =================================================================
	/**
	 * GitLab API Issues List
	 **/
	class GitLabListIssues {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			this.state = n.state;
			this.labels = n.labels;
			this.milestone = n.milestone;
			this.order_by = n.order_by;
			this.sort = n.sort;
			var node = this;
			this.on('input', function(msg) {
				// Update if MSG has a value
				var project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				if (_isTypeOf('String', msg.payload.state)) {
					node.state = msg.payload.state;
				}
				if (_isTypeOf('String', msg.payload.labels)) {
					node.labels = msg.payload.labels;
				}
				if (_isTypeOf('String', msg.payload.milestone)) {
					node.milestone = msg.payload.milestone;
				}
				if (_isTypeOf('String', msg.payload.order_by)) {
					node.order_by = msg.payload.order_by;
				}
				if (_isTypeOf('String', msg.payload.sort)) {
					node.sort = msg.payload.sort;
				}
				var iid;
				if (_isTypeOf('Number', msg.payload.iid)) {
					iid = msg.payload.iid;
				}
				const client = createClient(node);
				return processResult(
					client.Issues.all(project_id, {
						iid: iid,
						state: node.state,
						labels: node.labels,
						milestone: node.milestone,
						order_by: node.order_by,
						sort: node.sort
					}),
					node,
					msg
				);
			});
		}
	}
	RED.nodes.registerType('GitLab-List-Issues', GitLabListIssues);

	/**
	 * GitLab API Create Issue
	 **/
	class GitLabCreateIssue {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			var node = this;
			this.on('input', function(msg) {
				// Update if MSG has a value
				var project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				var title;
				if (_isTypeOf('String', msg.payload.title)) {
					title = msg.payload.title;
				}
				var description;
				if (_isTypeOf('String', msg.payload.description)) {
					description = msg.payload.description;
				}
				var assignee_id;
				if (_isTypeOf('Number', msg.payload.assignee_id)) {
					assignee_id = msg.payload.assignee_id;
				}
				var milestone_id;
				if (_isTypeOf('Number', msg.payload.milestone_id)) {
					milestone_id = msg.payload.milestone_id;
				}
				var labels;
				if (_isTypeOf('String', msg.payload.labels)) {
					labels = msg.payload.labels;
				}
				const client = createClient(node);
				return processResult(
					client.Issues.create(project_id, {
						title: title,
						description: description,
						assignee_id: assignee_id,
						milestone_id: milestone_id,
						labels: labels
					}),
					node,
					msg
				);
			});
		}
	}
	RED.nodes.registerType('GitLab-Create-Issue', GitLabCreateIssue);

	/**
	 * GitLab API Update Issue
	 **/
	class GitLabUpdateIssue {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			var node = this;
			this.on('input', function(msg) {
				// Update Params
				var param = {};
				// Update if MSG has a value
				let project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				// if (_isTypeOf('Number', project_id)) {
				// 	param.id = project_id;
				// }
				let issue_id;
				if (_isTypeOf('Number', msg.payload.issue_id)) {
					issue_id = msg.payload.issue_id;
					//param.issue_id = issue_id;
					console.log('In Issue ID: ', issue_id);
				}
				console.log('After Issue ID: ', issue_id, ' msg: ', msg.payload);
				let title;
				if (_isTypeOf('String', msg.payload.title)) {
					title = msg.payload.title;
					param.title = title;
				}
				let description;
				if (_isTypeOf('String', msg.payload.description)) {
					description = msg.payload.description;
					param.description = description;
				}
				let assignee_id;
				if (_isTypeOf('Number', msg.payload.assignee_id)) {
					assignee_id = msg.payload.assignee_id;
					param.assignee_id = assignee_id;
				}
				let milestone_id;
				if (_isTypeOf('Number', msg.payload.milestone_id)) {
					milestone_id = msg.payload.milestone_id;
					param.milestone_id = milestone_id;
				}
				let labels;
				if (_isTypeOf('String', msg.payload.labels)) {
					labels = msg.payload.labels;
					param.labels = labels;
				}
				let state_event;
				if (_isTypeOf('String', msg.payload.state_event)) {
					state_event = msg.payload.state_event;
					param.state_event = state_event;
				}
				const client = createClient(node);
				return processResult(client.Issues.edit(project_id, issue_id, param), node, msg);
			});
		}
	}
	RED.nodes.registerType('GitLab-Update-Issue', GitLabUpdateIssue);

	/**
	 * GitLab API List Notes
	 **/
	class GitLabListNotes {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			var node = this;
			this.on('input', function(msg) {
				// Update if MSG has a value
				var project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				var issue_id;
				if (_isTypeOf('Number', msg.payload.issue_id)) {
					issue_id = msg.payload.issue_id;
				}
				var client = Gitlab.create({
					url: node.gitlabConfig.url,
					token: node.gitlabConfig.key
				});
				client.issues.listNotes(
					{
						id: project_id,
						issue_id: issue_id
					},
					function(error, body) {
						if (!error) {
							msg.payload = body;
							node.send(msg);
							node.log(RED._('Succeeded to API Call.'));
						} else {
							var myErr = {
								inputMessage: msg,
								error: error
							};
							console.log(myErr);
							node.error('Failed to API Call. ' + error, myErr);
						}
					}
				);
			});
		}
	}
	RED.nodes.registerType('GitLab-List-Notes', GitLabListNotes);

	/**
	 * GitLab API Create Notes
	 **/
	class GitLabCreateNote {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			var node = this;
			this.on('input', function(msg) {
				// Update if MSG has a value
				var project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				var issue_id;
				if (_isTypeOf('Number', msg.payload.issue_id)) {
					issue_id = msg.payload.issue_id;
				}
				var body;
				if (_isTypeOf('String', msg.payload.body)) {
					body = msg.payload.body;
				}
				var client = Gitlab.create({
					url: node.gitlabConfig.url,
					token: node.gitlabConfig.key
				});
				client.issues.createNote(
					{
						id: project_id,
						issue_id: issue_id,
						body: body
					},
					function(error, body) {
						if (!error) {
							msg.payload = body;
							node.send(msg);
							node.log(RED._('Succeeded to API Call.'));
						} else {
							var myErr = {
								inputMessage: msg,
								error: error
							};
							console.log(myErr);
							node.error('Failed to API Call. ' + error, myErr);
						}
					}
				);
			});
		}
	}
	RED.nodes.registerType('GitLab-Create-Note', GitLabCreateNote);

	/**
	 * GitLab API Create Notes
	 **/
	class GitLabUpdateNote {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			var node = this;
			this.on('input', function(msg) {
				// Update if MSG has a value
				var project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				var issue_id;
				if (_isTypeOf('Number', msg.payload.issue_id)) {
					issue_id = msg.payload.issue_id;
				}
				var note_id;
				if (_isTypeOf('Number', msg.payload.note_id)) {
					note_id = msg.payload.note_id;
				}
				var body;
				if (_isTypeOf('String', msg.payload.body)) {
					body = msg.payload.body;
				}
				var client = Gitlab.create({
					url: node.gitlabConfig.url,
					token: node.gitlabConfig.key
				});
				client.issues.updateNote(
					{
						id: project_id,
						issue_id: issue_id,
						note_id: note_id,
						body: body
					},
					function(error, body) {
						if (!error) {
							msg.payload = body;
							node.send(msg);
							node.log(RED._('Succeeded to API Call.'));
						} else {
							var myErr = {
								inputMessage: msg,
								error: error
							};
							console.log(myErr);
							node.error('Failed to API Call. ' + error, myErr);
						}
					}
				);
			});
		}
	}
	RED.nodes.registerType('GitLab-Update-Note', GitLabUpdateNote);

	// === RepositoryFiles ========================================================
	/**
	 * GitLab Get RepositoryFile
	 **/
	class GitLabGetRepositoryFile {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			this.ref = n.ref;
			const node = this;
			this.on('input', function(msg) {
				// Update if MSG has a value
				let project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				let ref = node.ref;
				if (_isTypeOf('String', msg.payload.ref)) {
					ref = msg.payload.ref;
				}
				let file_path;
				if (_isTypeOf('String', msg.payload.file_path)) {
					file_path = msg.payload.file_path;
				}
				const client = createClient(node);
				return processResult(client.RepositoryFiles.show(project_id, file_path, ref), node, msg);
			});
		}
	}
	RED.nodes.registerType('GitLab-Get-RepositoryFile', GitLabGetRepositoryFile);

	/**
	 * GitLab Create RepositoryFile
	 **/
	class GitLabCreateRepositoryFile {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			this.branch_name = n.branch_name;
			this.encoding = n.encoding;
			const node = this;
			this.on('input', function(msg) {
				const param = {};
				// Update if MSG has a value
				let project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				if (_isTypeOf('Number', project_id)) {
					param.id = project_id;
				}
				let branch_name = node.branch_name;
				if (_isTypeOf('String', msg.payload.branch_name)) {
					branch_name = msg.payload.branch_name;
				}
				// if (_isTypeOf('String', branch_name)) {
				// 	param.branch_name = branch_name;
				// }
				let encoding = node.encoding;
				if (_isTypeOf('String', msg.payload.encoding)) {
					encoding = msg.payload.encoding;
				}
				if (_isTypeOf('String', encoding)) {
					if (encoding === 'base64') {
						param.encoding = encoding;
					}
				}
				let file_path;
				if (_isTypeOf('String', msg.payload.file_path)) {
					file_path = msg.payload.file_path;
					// param.file_path = file_path;
				}
				let content;
				if (_isTypeOf('String', msg.payload.content)) {
					content = msg.payload.content;
					param.content = content;
				}
				let commit_message;
				if (_isTypeOf('String', msg.payload.commit_message)) {
					commit_message = msg.payload.commit_message;
					param.commit_message = commit_message;
				}
				const client = createClient(node);
				return processResult(client.RepositoryFiles.create(project_id, file_path, branch_name, param), node, msg);
			});
		}
	}
	RED.nodes.registerType('GitLab-Create-RepositoryFile', GitLabCreateRepositoryFile);

	/**
	 * GitLab Update RepositoryFile
	 **/
	class GitLabUpdateRepositoryFile {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			this.branch_name = n.branch_name;
			this.encoding = n.encoding;
			const node = this;
			this.on('input', function(msg) {
				const param = {};
				// Update if MSG has a value
				let project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				// if (_isTypeOf('Number', project_id)) {
				// 	param.id = project_id;
				// }
				let branch_name = node.branch_name;
				if (_isTypeOf('String', msg.payload.branch_name)) {
					branch_name = msg.payload.branch_name;
				}
				// if (_isTypeOf('String', branch_name)) {
				// 	param.branch_name = branch_name;
				// }
				let encoding = node.encoding;
				if (_isTypeOf('String', msg.payload.encoding)) {
					encoding = msg.payload.encoding;
				}
				if (_isTypeOf('String', encoding)) {
					if (encoding === 'base64') {
						param.encoding = encoding;
					}
				}
				let file_path;
				if (_isTypeOf('String', msg.payload.file_path)) {
					file_path = msg.payload.file_path;
					// param.file_path = file_path;
				}
				let content;
				if (_isTypeOf('String', msg.payload.content)) {
					content = msg.payload.content;
					param.content = content;
				}
				let commit_message;
				if (_isTypeOf('String', msg.payload.commit_message)) {
					commit_message = msg.payload.commit_message;
					param.commit_message = commit_message;
				}
				const client = createClient(node);
				//edit(projectId, filePath, branch, options
				return processResult(client.RepositoryFiles.show(project_id, file_path, branch_name, param), node, msg);
			});
		}
	}
	RED.nodes.registerType('GitLab-Update-RepositoryFile', GitLabUpdateRepositoryFile);

	/**
	 * GitLab Remove RepositoryFile
	 **/
	class GitLabRemoveRepositoryFile {
		constructor(n) {
			RED.nodes.createNode(this, n);
			this.gitlabConfig = RED.nodes.getNode(n.gitlabconfig);
			this.branch_name = n.branch_name;
			const node = this;
			this.on('input', function(msg) {
				const param = {};
				// Update if MSG has a value
				let project_id = Number(node.gitlabConfig.project_id);
				if (_isTypeOf('Number', msg.payload.project_id)) {
					project_id = msg.payload.project_id;
				}
				// if (_isTypeOf('Number', project_id)) {
				// 	param.id = project_id;
				// }
				let branch_name = node.branch_name;
				if (_isTypeOf('String', msg.payload.branch_name)) {
					branch_name = msg.payload.branch_name;
				}
				// if (_isTypeOf('String', branch_name)) {
				// 	param.branch_name = branch_name;
				// }
				let file_path;
				if (_isTypeOf('String', msg.payload.file_path)) {
					file_path = msg.payload.file_path;
					// param.file_path = file_path;
				}
				let commit_message;
				if (_isTypeOf('String', msg.payload.commit_message)) {
					commit_message = msg.payload.commit_message;
					param.commit_message = commit_message;
				}
				const client = createClient(node);
				// edit(projectId, filePath, branch, options
				return processResult(client.RepositoryFiles.remove(project_id, file_path, branch_name, param), node, msg);
			});
		}
	}
	RED.nodes.registerType('GitLab-Remove-RepositoryFile', GitLabRemoveRepositoryFile);

	/**
	 * Object type comparison
	 *    String
	 *    Number
	 *    Boolean
	 *    Date
	 *    Error
	 *    Array
	 *    Function
	 *    RegExp
	 *    Object
	 **/
	function _isTypeOf(type, obj) {
		var clas = Object.prototype.toString.call(obj).slice(8, -1);
		return obj !== undefined && obj !== null && clas === type;
	}
};
