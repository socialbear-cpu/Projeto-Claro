document.addEventListener('DOMContentLoaded', function () {
	// Form Modal Handler
	const addBtn = document.getElementById('addBtn');
	const formModal = document.getElementById('formModal');
	const closeFormBtn = document.getElementById('closeForm');
	const dataForm = document.getElementById('dataForm');
	const recordsContainer = document.getElementById('recordsContainer');

	// Armazenar registros em localStorage
	let records = JSON.parse(localStorage.getItem('records')) || [];

	// Lista de arquivos predefinidos
	const predefinedFiles = [
		'Padrão de Vistoria',
		'Book Fotografico',
		'Termo de Construção',
		'Termo de Vistoria',
		'Ordem de Serviço',
		'Mapa de Piso',
		'Projeto Eletronico'
	];

	// Função para salvar registros
	function saveRecords() {
		localStorage.setItem('records', JSON.stringify(records));
		if (typeof populateFilterOptions === 'function') populateFilterOptions();
	}

	// Função para renderizar registros (aceita lista opcional)
	function renderRecords(list) {
		if (!recordsContainer) return; // proteja quando não estivermos na página de controle
		const toRender = Array.isArray(list) ? list : records;
		recordsContainer.innerHTML = '';
		toRender.forEach((record, index) => {
			const recordItem = document.createElement('div');
			recordItem.className = 'record-item';
			recordItem.innerHTML = `
				<div class="record-info">
					<div class="record-endereco">${record.endereco}</div>
					<div class="record-codigo">Código: ${record.codigo}</div>
				</div>
				<div class="record-actions">
					<select class="record-status" onchange="updateRecordStatus(${index}, this.value)">
						<option value="Pendente" ${record.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
						<option value="Projeto" ${record.status === 'Projeto' ? 'selected' : ''}>Projeto</option>
						<option value="Construção" ${record.status === 'Construção' ? 'selected' : ''}>Construção</option>
						<option value="SAR" ${record.status === 'SAR' ? 'selected' : ''}>SAR</option>
						<option value="Pend. Rede" ${record.status === 'Pend. Rede' ? 'selected' : ''}>Pend. Rede</option>
						<option value="Reprovado" ${record.status === 'Reprovado' ? 'selected' : ''}>Reprovado</option>
						<option value="Concluido" ${record.status === 'Concluido' ? 'selected' : ''}>Concluido</option>
					</select>
					<button class="record-view-btn" onclick="openViewModal(${index})">👁</button>
					<button class="record-arrow" onclick="openEditModal(${index})">→</button>
				</div>
			`;
			recordsContainer.appendChild(recordItem);
		});
	}

	// Função para atualizar status de um registro
	window.updateRecordStatus = function(index, status) {
		records[index].status = status;
		saveRecords();
	};

	// Função para abrir modal de visualização (somente leitura)
	window.openViewModal = function(index) {
		const record = records[index];
		const viewModal = document.createElement('div');
		viewModal.className = 'edit-modal open view-modal';
		const attachmentsHtml = (record.attachments || []).map((file, fIndex) => {
			return `
				<div class="attachment-item">
					<div>
						<strong>${file.customName || file.name}</strong><br>
						<small style="color: #999;">${file.name}</small>
					</div>
					<div style="display:flex; gap:8px;">
						<button type="button" onclick="downloadAttachment(${index}, ${fIndex})" style="background:#3498db; color:#fff; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Download</button>
					</div>
				</div>
			`;
		}).join('');

		// Determinar arquivos predefinidos anexados
		const attachedPredefined = new Set();
		if (record.attachments) {
			record.attachments.forEach(att => {
				predefinedFiles.forEach(pre => {
					if (att.customName && att.customName.startsWith(pre)) {
						attachedPredefined.add(pre);
					}
				});
			});
		}

		const predefinedFilesHtml = predefinedFiles.map(fileName => {
			const bgColor = attachedPredefined.has(fileName) ? '#d4edda' : '#fff3cd'; // verde claro se anexado, amarelo se não
			return `
				<div class="predefined-file-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px; background: ${bgColor};">
					<span>${fileName}</span>
					<button type="button" onclick="attachPredefinedFile(${index}, '${fileName}')" style="background:#fff; color:#000; border:1px solid #ddd; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Anexar</button>
				</div>
			`;
		}).join('');

		const commentsHtml = (record.comments || []).map((comment, cIndex) => {
			return `
				<div class="comment-item" style="border: 1px solid #ddd; border-radius: 6px; padding: 10px; margin-bottom: 8px; background: #f8f9fa;">
					<div style="display: flex; justify-content: space-between; align-items: center;">
					<small style="color: #666;">${comment.date || new Date().toLocaleString('pt-BR')}</small>
						<button type="button" onclick="deleteComment(${index}, ${cIndex})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remover</button>
					</div>
					<div style="margin-top: 5px;">${comment.text.replace(/\n/g, '<br>')}</div>
				</div>
			`;
		}).join('');

		viewModal.innerHTML = `
			<div class="view-container">
				<button class="close-edit" onclick="this.closest('.edit-modal').remove()">×</button>
				<h2>Visualizar Registro</h2>
				<div class="view-content">
					<div class="view-row"><strong>Endereço:</strong><div>${record.endereco || ''}</div></div>
					<div class="view-row"><strong>Código:</strong><div>${record.codigo || ''}</div></div>
					<div class="view-row"><strong>Bairro:</strong><div>${record.bairro || ''}</div></div>
					<div class="view-row"><strong>Complemento:</strong><div>${record.complemento || ''}</div></div>
					<div class="view-row"><strong>CEP:</strong><div>${record.cep || ''}</div></div>
					<div class="view-row"><strong>Cidade:</strong><div>${record.cidade || ''}</div></div>
					<div class="view-row"><strong>Cliente:</strong><div>${record.cliente || ''}</div></div>
					<div class="view-row"><strong>Celular:</strong><div>${record.celular || ''}</div></div>
					<div class="view-row"><strong>Node:</strong><div>${record.node || ''}</div></div>
					<div class="view-row"><strong>Origem:</strong><div>${record.origem || ''}</div></div>
					<div class="view-row" style="grid-column: 1 / -1"><strong>Observação:</strong><div>${(record.observacao || '').replace(/\n/g, '<br>')}</div></div>
					<div class="attachments-section" style="grid-column: 1 / -1">
						<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
							<h3 onclick="toggleAttachmentsVisibility(${index})" style="cursor: pointer; user-select: none;">Anexos ▼</h3>
						</div>
						<div class="predefined-files-list" style="margin-bottom: 15px;">
							<h4 onclick="togglePredefinedFilesVisibility(${index})" style="cursor: pointer; user-select: none;">Arquivos Predefinidos ▼</h4>
							<div id="predefinedFilesList${index}">${predefinedFilesHtml}</div>
						</div>
						<div class="attachments-list" id="attachmentsList${index}">${attachmentsHtml || '<div style="color:#777">Nenhum anexo</div>'}</div>
					</div>
					<div class="comments-section" style="grid-column: 1 / -1; margin-top: 20px;">
						<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
							<h3 onclick="toggleCommentsVisibility(${index})" style="cursor: pointer; user-select: none;">Histórico de Comentários ▼</h3>
						</div>
						<div style="display: flex; gap: 10px; margin-bottom: 15px;">
							<input type="text" id="commentInputView${index}" placeholder="Digite o comentário" style="flex: 2; padding: 8px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
							<button type="button" onclick="addCommentInlineView(${index})" style="flex: 1; padding: 2px 4px; font-size: 12px;">+ Comentário</button>
						</div>
						<div class="comments-list" id="commentsList${index}">${commentsHtml || '<div style="color:#777">Nenhum comentário</div>'}</div>
					</div>
				</div>
			</div>
		`;
		document.body.appendChild(viewModal);
		viewModal.addEventListener('click', (e) => {
			if (e.target === viewModal) viewModal.remove();
		});
	};

	// Função para abrir modal de edição
	window.openEditModal = function(index) {
		const record = records[index];
		const editModal = document.createElement('div');
		editModal.className = 'edit-modal open';
		editModal.innerHTML = `
			<div class="edit-container">
				<button class="close-edit" onclick="this.closest('.edit-modal').remove()">×</button>
				<h2>Editar Registro</h2>
				<form class="edit-form">
					<div class="form-group">
						<label>Endereço</label>
						<input type="text" value="${record.endereco}" name="endereco">
					</div>
					<div class="form-group">
						<label>Código de Imóvel</label>
						<input type="text" value="${record.codigo}" name="codigo">
					</div>
					<div class="form-group">
						<label>Bairro</label>
						<input type="text" value="${record.bairro}" name="bairro">
					</div>
					<div class="form-group">
						<label>Complemento</label>
						<input type="text" value="${record.complemento || ''}" name="complemento">
					</div>
					<div class="form-group">
						<label>CEP</label>
						<input type="text" value="${record.cep}" name="cep">
					</div>
					<div class="form-group">
						<label>Cidade</label>
						<input type="text" value="${record.cidade}" name="cidade">
					</div>
					<div class="form-group">
						<label>Nome do Cliente</label>
						<input type="text" value="${record.cliente}" name="cliente">
					</div>
					<div class="form-group">
						<label>Celular</label>
						<input type="tel" value="${record.celular}" name="celular">
					</div>
					<div class="form-group">
						<label>Node</label>
						<input type="text" value="${record.node}" name="node">
					</div>
					<div class="form-group">
						<label>Origem</label>
						<select name="origem">
							<option value="Demanda SGD" ${record.origem === 'Demanda SGD' ? 'selected' : ''}>Demanda SGD</option>
							<option value="E-mail" ${record.origem === 'E-mail' ? 'selected' : ''}>E-mail</option>
							<option value="GPON Ongoing" ${record.origem === 'GPON Ongoing' ? 'selected' : ''}>GPON Ongoing</option>
							<option value="Projeto F" ${record.origem === 'Projeto F' ? 'selected' : ''}>Projeto F</option>
						</select>
					</div>
					<div class="form-group">
						<label>Observação</label>
						<textarea name="observacao">${record.observacao || ''}</textarea>
					</div>

					<div class="attachments-section">
						<h3>Anexos</h3>
						<div style="display: flex; gap: 10px; margin-bottom: 15px;">
							<input type="text" id="fileName${index}" placeholder="Nome do arquivo" style="flex: 2; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px;">
							<input type="file" id="fileInput${index}" onchange="handleFileUpload(event, ${index})" style="display: none;">
							<button type="button" class="file-upload-btn" onclick="document.getElementById('fileInput${index}').click()" style="flex: 1; padding: 4px 8px; font-size: 12px;">+ Adicionar</button>
						</div>
						<div class="attachments-list" id="attachments${index}">
							${record.attachments ? record.attachments.map((file, fIndex) => `
								<div class="attachment-item">
									<div>
										<strong>${file.customName || file.name}</strong><br>
										<small style="color: #999;">${file.name}</small>
									</div>
									<div style="display: flex; gap: 8px;">
										<button type="button" onclick="downloadAttachment(${index}, ${fIndex})" style="background: #3498db; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Download</button>
										<button type="button" onclick="removeAttachment(${index}, ${fIndex})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remover</button>
									</div>
								</div>
							`).join('') : ''}
						</div>
					</div>

					<div class="edit-form-buttons">
						<button type="button" class="edit-save-btn" onclick="saveEditedRecord(${index})">Salvar</button>
						<button type="button" class="edit-delete-btn" onclick="deleteRecord(${index})">Deletar</button>
					</div>
				</form>
			</div>
		`;
		document.body.appendChild(editModal);
		editModal.addEventListener('click', (e) => {
			if (e.target === editModal) editModal.remove();
		});
	};

	// Função para salvar registro editado
	window.saveEditedRecord = function(index) {
		const form = document.querySelector('.edit-form');
		const formData = new FormData(form);
		records[index] = {
			...records[index],
			endereco: formData.get('endereco'),
			codigo: formData.get('codigo'),
			bairro: formData.get('bairro'),
			complemento: formData.get('complemento'),
			cep: formData.get('cep'),
			cidade: formData.get('cidade'),
			cliente: formData.get('cliente'),
			celular: formData.get('celular'),
			node: formData.get('node'),
			origem: formData.get('origem'),
			observacao: formData.get('observacao')
		};
		saveRecords();
		document.querySelector('.edit-modal').remove();
		renderRecords();
		alert('Registro atualizado com sucesso!');
	};

	// Função para deletar registro
	window.deleteRecord = function(index) {
		if (confirm('Tem certeza que deseja deletar este registro?')) {
			records.splice(index, 1);
			saveRecords();
			document.querySelector('.edit-modal').remove();
			renderRecords();
		}
	};

	// Função para adicionar anexos
	window.handleFileUpload = function(event, index) {
		const files = Array.from(event.target.files);
		const customNameInput = document.getElementById(`fileName${index}`);
		const customName = customNameInput ? customNameInput.value : '';

		if (!records[index].attachments) {
			records[index].attachments = [];
		}

		let processed = 0;
		files.forEach((file, fileIndex) => {
			const reader = new FileReader();
			reader.onload = () => {
				const finalCustomName = customName && files.length === 1 ? customName : '';
				records[index].attachments.push({
					name: file.name,
					customName: finalCustomName,
					data: reader.result
				});
				processed++;
				if (processed === files.length) {
					saveRecords();
					// Limpar input de nome
					if (customNameInput) customNameInput.value = '';
					// Atualizar lista de anexos no modal sem reabri-lo
					const attachmentsList = document.getElementById(`attachments${index}`);
					if (attachmentsList) {
						const record = records[index];
						attachmentsList.innerHTML = record.attachments ? record.attachments.map((file, fIndex) => `
							<div class="attachment-item">
								<div>
									<strong>${file.customName || file.name}</strong><br>
									<small style="color: #999;">${file.name}</small>
								</div>
								<div style="display: flex; gap: 8px;">
									<button type="button" onclick="downloadAttachment(${index}, ${fIndex})" style="background: #3498db; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Download</button>
									<button type="button" onclick="removeAttachment(${index}, ${fIndex})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remover</button>
								</div>
							</div>
						`).join('') : '';
					}
				}
			};
			reader.readAsDataURL(file);
		});
	};

	// Função para remover anexo
	window.removeAttachment = function(index, fileIndex) {
		records[index].attachments.splice(fileIndex, 1);
		saveRecords();
		// Atualizar lista de anexos no modal sem reabri-lo
		const attachmentsList = document.getElementById(`attachments${index}`);
		if (attachmentsList) {
			const record = records[index];
			attachmentsList.innerHTML = record.attachments ? record.attachments.map((file, fIndex) => `
				<div class="attachment-item">
					<div>
						<strong>${file.customName || file.name}</strong><br>
						<small style="color: #999;">${file.name}</small>
					</div>
					<div style="display: flex; gap: 8px;">
						<button type="button" onclick="downloadAttachment(${index}, ${fIndex})" style="background: #3498db; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Download</button>
						<button type="button" onclick="removeAttachment(${index}, ${fIndex})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remover</button>
					</div>
				</div>
			`).join('') : '';
		}
	};

	// Função para fazer download de anexo
	window.downloadAttachment = function(index, fileIndex) {
		const attachment = records[index].attachments[fileIndex];
		const link = document.createElement('a');
		link.href = attachment.data;
		link.download = attachment.customName || attachment.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Função para anexar arquivo predefinido
	window.attachPredefinedFile = function(index, fileName) {
		// Criar um input de arquivo temporário
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.style.display = 'none';
		fileInput.onchange = (event) => {
			const files = Array.from(event.target.files);
			if (files.length > 0) {
				const file = files[0];
				const reader = new FileReader();
				reader.onload = () => {
					if (!records[index].attachments) {
						records[index].attachments = [];
					}
					// Determinar o customName com contador se necessário
					let existing = records[index].attachments.filter(att => att.customName.startsWith(fileName));
					let maxNum = 0;
					existing.forEach(att => {
						let match = att.customName.match(new RegExp(`^${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: \\((\\d+)\\))?$`));
						if (match) {
							if (match[1]) {
								maxNum = Math.max(maxNum, parseInt(match[1]));
							} else {
								maxNum = Math.max(maxNum, 1);
							}
						}
					});
					let customName = fileName;
					if (maxNum > 0) {
						customName = `${fileName} (${maxNum + 1})`;
					}
					records[index].attachments.push({
						name: file.name,
						customName: customName,
						data: reader.result
					});
					saveRecords();
					// Atualizar lista de anexos no modal de visualização sem reabri-lo
					const attachmentsList = document.getElementById(`attachmentsList${index}`);
					if (attachmentsList) {
						const record = records[index];
						const attachmentsHtml = (record.attachments || []).map((file, fIndex) => {
							return `
								<div class="attachment-item">
									<div>
										<strong>${file.customName || file.name}</strong><br>
										<small style="color: #999;">${file.name}</small>
									</div>
									<div style="display:flex; gap:8px;">
										<button type="button" onclick="downloadAttachment(${index}, ${fIndex})" style="background:#3498db; color:#fff; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Download</button>
									</div>
								</div>
							`;
						}).join('');
						attachmentsList.innerHTML = attachmentsHtml || '<div style="color:#777">Nenhum anexo</div>';
					}
				};
				reader.readAsDataURL(file);
			}
			// Remover o input temporário
			document.body.removeChild(fileInput);
		};
		document.body.appendChild(fileInput);
		fileInput.click();
	};

	// Função para alternar visibilidade dos anexos no modal de visualização
	window.toggleAttachmentsVisibility = function(index) {
		const h3 = document.querySelector(`.view-modal h3[onclick*="toggleAttachmentsVisibility(${index})"]`);
		const list = document.getElementById(`attachmentsList${index}`);
		if (list.style.display === 'none') {
			list.style.display = 'block';
			h3.innerHTML = 'Anexos ▼';
		} else {
			list.style.display = 'none';
			h3.innerHTML = 'Anexos ▶';
		}
	};

	// Função para alternar visibilidade dos arquivos predefinidos no modal de visualização
	window.togglePredefinedFilesVisibility = function(index) {
		const h4 = document.querySelector(`.view-modal h4[onclick*="togglePredefinedFilesVisibility(${index})"]`);
		const list = document.getElementById(`predefinedFilesList${index}`);
		if (list.style.display === 'none') {
			list.style.display = 'block';
			h4.innerHTML = 'Arquivos Predefinidos ▼';
		} else {
			list.style.display = 'none';
			h4.innerHTML = 'Arquivos Predefinidos ▶';
		}
	};

	// Função para alternar visibilidade dos comentários no modal de visualização
	window.toggleCommentsVisibility = function(index) {
		const h3 = document.querySelector(`.view-modal h3[onclick*="toggleCommentsVisibility(${index})"]`);
		const list = document.getElementById(`commentsList${index}`);
		if (list.style.display === 'none') {
			list.style.display = 'block';
			h3.innerHTML = 'Histórico de Comentários ▼';
		} else {
			list.style.display = 'none';
			h3.innerHTML = 'Histórico de Comentários ▶';
		}
	};

	// Função para adicionar anexos no modal de visualização
	window.handleFileUploadView = function(event, index) {
		const files = Array.from(event.target.files);
		const customNameInput = document.getElementById(`fileNameView${index}`);
		const customName = customNameInput ? customNameInput.value : '';

		if (!records[index].attachments) {
			records[index].attachments = [];
		}

		files.forEach((file, fileIndex) => {
			const reader = new FileReader();
			reader.onload = () => {
				const finalCustomName = customName && files.length === 1 ? customName : '';
				records[index].attachments.push({
					name: file.name,
					customName: finalCustomName,
					data: reader.result
				});
				saveRecords();
				// Limpar input de nome
				if (customNameInput) customNameInput.value = '';
				// Reabrir modal para atualizar lista
				const currentIndex = index;
				document.querySelector('.view-modal').remove();
				openViewModal(currentIndex);
			};
			reader.readAsDataURL(file);
		});
	};

	// Função para adicionar comentários no modal de visualização
	window.addCommentInlineView = function(index) {
		const commentInput = document.getElementById(`commentInputView${index}`);
		const commentText = commentInput ? commentInput.value.trim() : '';

		if (commentText) {
			if (!records[index].comments) {
				records[index].comments = [];
			}
			records[index].comments.push({
				text: commentText,
				date: new Date().toLocaleString('pt-BR')
			});
			saveRecords();
			// Limpar input de comentário
			if (commentInput) commentInput.value = '';
			// Reabrir modal para atualizar lista
			document.querySelector('.view-modal').remove();
			openViewModal(index);
		}
	};

	// Função para abrir modal de comentário estilizado
	window.openCommentModal = function(index) {
		const commentModal = document.createElement('div');
		commentModal.className = 'comment-modal open';
		commentModal.innerHTML = `
			<div class="comment-modal-content">
				<button class="close-comment-modal" onclick="this.closest('.comment-modal').remove()">×</button>
				<h3>Adicionar Comentário</h3>
				<textarea id="commentTextarea" placeholder="Digite seu comentário aqui..." rows="4" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit; resize: vertical;"></textarea>
				<div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
					<button class="cancel-comment-btn" onclick="this.closest('.comment-modal').remove()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancelar</button>
					<button class="save-comment-btn" onclick="saveComment(${index})" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Salvar</button>
				</div>
			</div>
		`;
		document.body.appendChild(commentModal);
		commentModal.addEventListener('click', (e) => {
			if (e.target === commentModal) commentModal.remove();
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') commentModal.remove();
		});
	};

	// Função para salvar comentário
	window.saveComment = function(index) {
		const textarea = document.getElementById('commentTextarea');
		const commentText = textarea ? textarea.value.trim() : '';
		if (commentText) {
			if (!records[index].comments) {
				records[index].comments = [];
			}
			records[index].comments.push({
				text: commentText,
				date: new Date().toLocaleString('pt-BR')
			});
			saveRecords();
			// Fechar modal de comentário
			document.querySelector('.comment-modal').remove();
			// Reabrir modal de visualização para atualizar lista
			document.querySelector('.view-modal').remove();
			openViewModal(index);
		}
	};

	// Função para adicionar comentário (mantida para compatibilidade)
	window.addComment = function(index) {
		const commentText = prompt('Digite seu comentário:');
		if (commentText && commentText.trim()) {
			if (!records[index].comments) {
				records[index].comments = [];
			}
			records[index].comments.push({
				text: commentText.trim(),
				date: new Date().toLocaleString('pt-BR')
			});
			saveRecords();
			// Reabrir modal para atualizar lista
			document.querySelector('.view-modal').remove();
			openViewModal(index);
		}
	};

	// Função para deletar comentário
	window.deleteComment = function(index, commentIndex) {
		if (confirm('Tem certeza que deseja deletar este comentário?')) {
			records[index].comments.splice(commentIndex, 1);
			saveRecords();
			// Reabrir modal para atualizar lista
			document.querySelector('.view-modal').remove();
			openViewModal(index);
		}
	};

	// Export functionality
	const exportBtn = document.getElementById('exportBtn');

	if (exportBtn) {
		exportBtn.addEventListener('click', () => {
			const filteredRecords = getFilteredRecords();

			// Calculate max attachments, comments, and observacao lines for dynamic columns
			let maxAttachments = 0;
			let maxComments = 0;
			let maxObservacaoLines = 0;
			filteredRecords.forEach(record => {
				if (record.attachments && record.attachments.length > maxAttachments) {
					maxAttachments = record.attachments.length;
				}
				if (record.comments && record.comments.length > maxComments) {
					maxComments = record.comments.length;
				}
				if (record.observacao) {
					const lines = record.observacao.split('\n').length;
					if (lines > maxObservacaoLines) {
						maxObservacaoLines = lines;
					}
				}
			});

			// Headers for CSV
			const headers = ['EPO', 'Endereco', 'Codigo', 'Bairro', 'Complemento', 'CEP', 'Cidade', 'Cliente', 'Celular', 'Node', 'Origem'];
			for (let i = 1; i <= maxObservacaoLines; i++) {
				headers.push(`Observacao${i}`);
			}
			headers.push('Status');
			for (let i = 1; i <= maxAttachments; i++) {
				headers.push(`Anexo${i}`);
			}
			for (let i = 1; i <= maxComments; i++) {
				headers.push(`Comentario${i}`);
			}

			// Function to escape CSV fields
			const escapeCSV = (field) => {
				if (typeof field === 'string' && (field.includes(';') || field.includes('"') || field.includes('\n'))) {
					return '"' + field.replace(/"/g, '""') + '"';
				}
				return field || '';
			};

			// Create CSV rows
			const csvRows = [headers.join(';')];
			filteredRecords.forEach(record => {
				const row = [
					escapeCSV(record.EPO),
					escapeCSV(record.endereco),
					escapeCSV(record.codigo),
					escapeCSV(record.bairro),
					escapeCSV(record.complemento),
					escapeCSV(record.cep),
					escapeCSV(record.cidade),
					escapeCSV(record.cliente),
					escapeCSV(record.celular),
					escapeCSV(record.node),
					escapeCSV(record.origem)
				];

				// Add observacao lines
				const observacaoLines = record.observacao ? record.observacao.split('\n') : [];
				for (let i = 0; i < maxObservacaoLines; i++) {
					row.push(escapeCSV(observacaoLines[i] || ''));
				}

				row.push(escapeCSV(record.status));

				// Add attachment names
				for (let i = 0; i < maxAttachments; i++) {
					const attachment = record.attachments && record.attachments[i];
					row.push(escapeCSV(attachment ? (attachment.customName || attachment.name) : ''));
				}

				// Add comment texts
				for (let i = 0; i < maxComments; i++) {
					const comment = record.comments && record.comments[i];
					row.push(escapeCSV(comment ? comment.text : ''));
				}

				csvRows.push(row.join(';'));
			});

			const csvContent = '\ufeff' + csvRows.join('\n');
			const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(dataBlob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'registros_filtrados.csv';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		});
	}

	if (addBtn && formModal && closeFormBtn && dataForm) {
		// Abrir modal
		addBtn.addEventListener('click', () => {
			formModal.classList.add('open');
		});

		// Fechar modal
		closeFormBtn.addEventListener('click', () => {
			formModal.classList.remove('open');
		});

		// Fechar modal ao clicar fora
		formModal.addEventListener('click', (e) => {
			if (e.target === formModal) {
				formModal.classList.remove('open');
			}
		});

		// Fechar ao pressionar ESC
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				formModal.classList.remove('open');
			}
		});

		// Enviar formulário
		dataForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const formData = new FormData(dataForm);
			const newRecord = {
					EPO: formData.get('EPO'),
				endereco: formData.get('endereco'),
				codigo: formData.get('codigo'),
				bairro: formData.get('bairro'),
				complemento: formData.get('complemento'),
				cep: formData.get('cep'),
				cidade: formData.get('cidade'),
				cliente: formData.get('cliente'),
				celular: formData.get('celular'),
				node: formData.get('node'),
				origem: formData.get('origem'),
				observacao: formData.get('observacao'),
				attachments: []
			};
			records.push(newRecord);
			saveRecords();
			formModal.classList.remove('open');
			dataForm.reset();
			renderRecords();
		});
	}

	// Renderizar registros ao carregar
	renderRecords();

	// --- Filtragem e busca ---
	function getAllRecords() {
		try {
			const s = localStorage.getItem('records');
			return s ? JSON.parse(s) : records;
		} catch (e) {
			return records;
		}
	}

	function normalizeStr(s) {
		return String(s || '').trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
	}

	function populateFilterOptions() {
	    // rebuild a clean filters panel from current data and form selects
	    const list = getAllRecords();
	    const origins = new Set();
	    const statuses = new Set();
	    const epoSet = new Set();
	    const citiesMap = new Map(); // key: lower -> display
	    
	    // default statuses
	    const defaultStatuses = ['Pendente','Projeto','Construção','SAR','Pend. Rede','Reprovado','Concluido'];
	    defaultStatuses.forEach(s => statuses.add(s));

	    // gather from records
	    list.forEach(r => {
	        if (r.origem) origins.add(String(r.origem).trim());
	        if (r.status) statuses.add(String(r.status).trim());
	        if (r.EPO) epoSet.add(String(r.EPO).trim());
	    });
	    
	    // gather from form selects only (not from record values)
	    const addFormOrig = document.querySelector('select[name="origem"]');
	    if (addFormOrig) Array.from(addFormOrig.options).forEach(o => { if (o.value) origins.add(String(o.value).trim()); });
	    
	    const addFormEpo = document.querySelector('select[name="EPO"]');
	    if (addFormEpo) Array.from(addFormEpo.options).forEach(o => { if (o.value) epoSet.add(String(o.value).trim()); });
	    
	    const addFormCity = document.querySelector('select[name="cidade"]');
	    if (addFormCity) Array.from(addFormCity.options).forEach(o => { const v = String(o.value || '').trim(); if (v) citiesMap.set(v.toLowerCase(), v); });
	    
	    const panel = document.getElementById('filtersPanel');
	    const actions = document.createElement('div');
	    actions.className = 'filter-actions';
	    panel.innerHTML = '';

	    const makeGroup = (title, listItems, name) => {
	        const g = document.createElement('div');
	        g.className = 'filter-group';
	        const h = document.createElement('h4'); h.textContent = title; g.appendChild(h);
	        Array.from(listItems).sort((a,b) => String(a).localeCompare(b, 'pt-BR')).forEach(v => {
	            const row = document.createElement('label'); row.className = 'filter-checkbox';
	            const inp = document.createElement('input'); inp.type = 'checkbox'; inp.name = name; inp.value = v;
	            inp.addEventListener('change', applyFiltersAndRender);
	            const span = document.createElement('span'); span.textContent = v;
	            row.appendChild(inp); row.appendChild(span);
	            g.appendChild(row);
	        });
	        return g;
	    };

	    if (origins.size) panel.appendChild(makeGroup('Origem', origins, 'originChk'));
	    if (epoSet.size) panel.appendChild(makeGroup('EPO', epoSet, 'epoValChk'));
	    if (statuses.size) panel.appendChild(makeGroup('Status', statuses, 'statusChk'));
	    
	    // Add Cidade filter at the end
	    if (citiesMap.size) panel.appendChild(makeGroup('Cidade', citiesMap.values(), 'cityChk'));
	    const save = document.createElement('button'); save.className = 'save-btn'; save.textContent = 'Salvar';
	    save.addEventListener('click', () => {
	        applyFiltersAndRender();
	        panel.classList.remove('open');
	        panel.setAttribute('aria-hidden', 'true');
	        const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
	        if (toggleFiltersBtn) toggleFiltersBtn.setAttribute('aria-expanded', 'false');
	    });
	    const clear = document.createElement('button'); clear.className = 'clear-btn'; clear.textContent = 'Limpar';
	    clear.addEventListener('click', () => {
	        panel.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
	        applyFiltersAndRender();
	    });
	    actions.appendChild(save); actions.appendChild(clear); panel.appendChild(actions);

	    const closeBtn = document.createElement('button'); closeBtn.className = 'panel-close'; closeBtn.textContent = '×';
	    closeBtn.addEventListener('click', () => {
	        panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
	        const toggleFiltersBtn = document.getElementById('toggleFiltersBtn'); if (toggleFiltersBtn) toggleFiltersBtn.setAttribute('aria-expanded', 'false');
	    });
	    panel.appendChild(closeBtn);
	}

	function getFilteredRecords() {
		const all = getAllRecords();
		const search = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
		const panel = document.getElementById('filtersPanel');
		let list = all;

		if (panel) {
			const selectedOrigins = Array.from(panel.querySelectorAll('input[name="originChk"]:checked')).map(i => String(i.value).toLowerCase());
			const selectedStatuses = Array.from(panel.querySelectorAll('input[name="statusChk"]:checked')).map(i => String(i.value).toLowerCase());
			const selectedCities = Array.from(panel.querySelectorAll('input[name="cityChk"]:checked')).map(i => normalizeStr(i.value));
			const selectedEpos = Array.from(panel.querySelectorAll('input[name="epoValChk"]:checked')).map(i => String(i.value).toLowerCase());

			if (selectedOrigins.length) list = list.filter(r => selectedOrigins.includes(String(r.origem || '').toLowerCase()));
			if (selectedStatuses.length) list = list.filter(r => selectedStatuses.includes(String(r.status || '').toLowerCase()));
			if (selectedCities.length) list = list.filter(r => selectedCities.includes(normalizeStr(r.cidade)));
			if (selectedEpos.length) list = list.filter(r => selectedEpos.includes(String(r.EPO || '').toLowerCase()));
		}

		if (search) {
			list = list.filter(r => {
				const hay = ((r.endereco||'') + ' ' + (r.codigo||'') + ' ' + (r.cliente||'') + ' ' + (r.observacao||'')).toLowerCase();
				return hay.includes(search);
			});
		}

		return list;
	}

	function applyFiltersAndRender() {
		const list = getFilteredRecords();
		renderRecords(list);
	}

	// wire up search input and populate panel
	populateFilterOptions();
	const searchEl = document.getElementById('searchInput');
	if (searchEl) searchEl.addEventListener('input', applyFiltersAndRender);

	const clearBtn = document.getElementById('clearFiltersBtn');
	if (clearBtn) clearBtn.addEventListener('click', () => {
		const panel = document.getElementById('filtersPanel');
		if (panel) panel.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
		if (searchEl) searchEl.value = '';
		applyFiltersAndRender();
	});

	// Toggle button to show/hide filters
	const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
	if (toggleFiltersBtn) {
		toggleFiltersBtn.addEventListener('click', () => {
			// toggle the overlay panel visibility
			const panel = document.getElementById('filtersPanel');
			if (!panel) return;
			const isOpen = !panel.classList.contains('open');
			panel.classList.toggle('open', isOpen);
			panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
			toggleFiltersBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			// when opening, refresh options
			if (isOpen && typeof populateFilterOptions === 'function') populateFilterOptions();
		});
	}

	// Resto do código existente
	const containers = document.querySelectorAll('.container');
	const menuBtn = document.getElementById('menuBtn');
	const sidebarMenu = document.getElementById('sidebarMenu');
	const closeMenuBtn = document.getElementById('closeMenu');

	if (menuBtn && sidebarMenu) {
		menuBtn.addEventListener('click', () => {
			sidebarMenu.classList.toggle('open');
		});
	}

	if (closeMenuBtn && sidebarMenu) {
		closeMenuBtn.addEventListener('click', () => {
			sidebarMenu.classList.remove('open');
		});

		const sidebarLinks = sidebarMenu.querySelectorAll('a');
		if (sidebarLinks && sidebarLinks.length) {
			sidebarLinks.forEach(link => {
				link.addEventListener('click', () => {
					sidebarMenu.classList.remove('open');
				});
			});
		}
	}

	if (sidebarMenu) {
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				sidebarMenu.classList.remove('open');
			}
		});

		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (sidebarMenu.classList.contains('open') && !sidebarMenu.contains(e.target) && e.target !== menuBtn) {
				sidebarMenu.classList.remove('open');
			}
		});
	}

	function linkifyUrls(text) {
		const urlRegex = /(https?:\/\/[^\s<>]+)/g;
		return text.replace(urlRegex, '<a href="$1" target="_blank" style="color: #eb1c1c; text-decoration: underline;">$1</a>');
	}

	function createDetailPanel(title, detail) {
		const panel = document.createElement('div');
		panel.className = 'detail-panel';
		panel.setAttribute('aria-hidden', 'false');

		const openCount = document.querySelectorAll('.detail-panel[aria-hidden="false"]').length;
		const offset = (openCount % 6) * 30; // px
		panel.style.left = `calc(50% + ${offset}px)`;
		panel.style.top = `calc(50% + ${offset}px)`;

		const detailHTML = linkifyUrls(detail).replace(/&#10;/g, '<br>');

		panel.innerHTML = `
			<button class="close-detail">×</button>
			<div class="detail-content">
				<h2>${title}</h2>
				<p>${detailHTML}</p>
			</div>
		`;

		panel.querySelector('.close-detail').addEventListener('click', () => {
			panel.remove();
		});

		const escHandler = (e) => {
			if (e.key === 'Escape') panel.remove();
		};
		document.addEventListener('keydown', escHandler);

		const observer = new MutationObserver(() => {
			if (!document.body.contains(panel)) {
				document.removeEventListener('keydown', escHandler);
				observer.disconnect();
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });

		document.body.appendChild(panel);
		return panel;
	}

	containers.forEach((c) => {
		const href = c.dataset.href;
		c.addEventListener('click', () => {
			if (href) {
				window.location.href = href;
				return;
			}
			const title = c.dataset.title || c.innerText.trim();
			const detail = c.dataset.detail || (title + ' — informações detalhadas aqui.');
			createDetailPanel(title, detail);
		});
		// Accessibility: allow Enter/Space to activate the container
		c.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (href) {
					window.location.href = href;
				} else {
					const title = c.dataset.title || c.innerText.trim();
					const detail = c.dataset.detail || (title + ' — informações detalhadas aqui.');
					createDetailPanel(title, detail);
				}
			}
		});
	});
});

