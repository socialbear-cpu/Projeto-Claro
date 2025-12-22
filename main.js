document.addEventListener('DOMContentLoaded', function () {
	// Form Modal Handler
	const addBtn = document.getElementById('addBtn');
	const formModal = document.getElementById('formModal');
	const closeFormBtn = document.getElementById('closeForm');
	const dataForm = document.getElementById('dataForm');
	const recordsContainer = document.getElementById('recordsContainer');

	// Armazenar registros em localStorage
	let records = JSON.parse(localStorage.getItem('records')) || [];

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
						<h3>Anexos</h3>
						<div class="attachments-list">${attachmentsHtml || '<div style="color:#777">Nenhum anexo</div>'}</div>
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
							<input type="text" id="fileName${index}" placeholder="Nome do arquivo" style="flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px;">
							<input type="file" id="fileInput${index}" onchange="handleFileUpload(event, ${index})" style="display: none;">
							<button type="button" class="file-upload-btn" onclick="document.getElementById('fileInput${index}').click()" style="flex: 0 0 auto;">+ Adicionar</button>
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
				document.querySelector('.edit-modal').remove();
				openEditModal(currentIndex);
			};
			reader.readAsDataURL(file);
		});
	};

	// Função para remover anexo
	window.removeAttachment = function(index, fileIndex) {
		records[index].attachments.splice(fileIndex, 1);
		saveRecords();
		const currentIndex = index;
		document.querySelector('.edit-modal').remove();
		openEditModal(currentIndex);
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

	function applyFiltersAndRender() {
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

