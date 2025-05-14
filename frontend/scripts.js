document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".sidebar ul li a");
    const mainContent = document.getElementById("main-content");
    const dropdownToggles = document.querySelectorAll(".sidebar .dropdown-toggle");

    // Dropdown functionality
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const dropdownMenu = toggle.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains("dropdown-menu")) {
                dropdownMenu.classList.toggle("show");
            }
        });
    });

    // Basic content loading (placeholder)
    const loadContent = (pageId) => {
        // Placeholder: In a real app, this would fetch HTML or use a router
        let content = `<h1>Página: ${pageId}</h1><p>Conteúdo da página ${pageId} será carregado aqui.</p>`;
        
        if (pageId === "nav-registrar-oportunidade") {
            content = renderizarFormularioOportunidade();
        } else if (pageId === "nav-consultar-oportunidades") {
            content = renderizarTabelaOportunidades();
        } else if (pageId === "nav-dashboard") {
            content = renderizarVisaoGeralDashboard();
        }
        // Adicionar mais `else if` para outras seções

        mainContent.innerHTML = content;
    };

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove("active"));
            // Add active class to the clicked link
            link.classList.add("active");

            const pageId = link.id;
            if (pageId) { // Only load content if it's a main link with an ID
                // If it's a dropdown toggle, don't load content, just toggle
                if (!link.classList.contains("dropdown-toggle")) {
                    loadContent(pageId);
                }
            }
        });
    });

    // Funções de renderização de conteúdo (placeholders)
    function renderizarVisaoGeralDashboard() {
        // Aqui virão os KPIs e gráficos principais
        return `
            <h1>Dashboard de Parcerias</h1>
            <div class="kpi-container">
                <div class="kpi-item">Total Oportunidades: <span id="total-oportunidades">-</span></div>
                <div class="kpi-item">Intragrupo: <span id="total-intragrupo">-</span></div>
                <div class="kpi-item">Externas (Entrada): <span id="total-externa-entrada">-</span></div>
                <div class="kpi-item">Externas (Saída): <span id="total-externa-saida">-</span></div>
            </div>
            <h2>Análise Intragrupo</h2>
            <div class="chart-container" id="chart-intragrupo-volume"></div>
            <div class="chart-container" id="chart-intragrupo-trocas"></div>
            <h2>Balança Comercial com Parceiros</h2>
            <div class="chart-container" id="chart-parceiros-saldo"></div>
        `;
    }

    function renderizarFormularioOportunidade() {
        // Este formulário será mais complexo e dinâmico
        return `
            <h1>Registrar Nova Oportunidade</h1>
            <form id="form-oportunidade">
                <label for="lead-empresa">Empresa do Lead:</label>
                <input type="text" id="lead-empresa" name="nome_empresa_lead" required><br><br>
                
                <label for="lead-contato">Contato do Lead:</label>
                <input type="text" id="lead-contato" name="nome_contato_lead" required><br><br>

                <label for="lead-email">E-mail do Lead:</label>
                <input type="email" id="lead-email" name="email_lead" required><br><br>

                <label for="lead-telefone">Telefone do Lead:</label>
                <input type="tel" id="lead-telefone" name="telefone_lead" required><br><br>

                <label for="data-envio">Data Envio/Recebimento:</label>
                <input type="date" id="data-envio" name="data_envio_recebimento" required><br><br>

                <label for="responsavel">Responsável:</label>
                <select id="responsavel" name="id_responsavel_envio_recebimento" required>
                    <!-- Options carregadas dinamicamente -->
                    <option value="1">Usuário 1</option> 
                </select><br><br>

                <label for="status-oportunidade">Status:</label>
                <select id="status-oportunidade" name="id_status_atual" required>
                    <!-- Options carregadas dinamicamente -->
                    <option value="1">Nova</option>
                </select><br><br>

                <label for="tipo-oportunidade">Tipo de Oportunidade:</label>
                <select id="tipo-oportunidade" name="tipo_oportunidade" required>
                    <option value="">Selecione...</option>
                    <option value="intragrupo">Intragrupo</option>
                    <option value="externa_entrada">Externa (Entrada)</option>
                    <option value="externa_saida">Externa (Saída)</option>
                </select><br><br>

                <div id="campos-intragrupo" style="display:none;">
                    <label for="empresa-origem-grupo">Empresa Origem (Grupo):</label>
                    <select id="empresa-origem-grupo" name="id_empresa_origem_grupo">
                        <!-- Options (Cryah, Lomadee, etc.) -->
                    </select><br><br>
                    <label for="empresa-destino-grupo">Empresa Destino (Grupo):</label>
                    <select id="empresa-destino-grupo" name="id_empresa_destino_grupo">
                        <!-- Options -->
                    </select><br><br>
                </div>

                <div id="campos-externa-entrada" style="display:none;">
                    <label for="parceiro-origem">Parceiro Externo Origem:</label>
                    <select id="parceiro-origem" name="id_parceiro_origem_externo">
                        <!-- Options -->
                    </select><br><br>
                    <label for="empresa-destino-grupo-entrada">Empresa Destino (Grupo):</label>
                    <select id="empresa-destino-grupo-entrada" name="id_empresa_destino_grupo_entrada">
                        <!-- Options -->
                    </select><br><br>
                </div>

                <div id="campos-externa-saida" style="display:none;">
                    <label for="empresa-origem-grupo-saida">Empresa Origem (Grupo):</label>
                    <select id="empresa-origem-grupo-saida" name="id_empresa_origem_grupo_saida">
                        <!-- Options -->
                    </select><br><br>
                    <label for="parceiros-destino">Parceiros Externos Destino (múltiplo):</label>
                    <select id="parceiros-destino" name="parceiros_destino_externo_ids" multiple>
                        <!-- Options -->
                    </select><br><br>
                </div>

                <button type="submit">Salvar Oportunidade</button>
            </form>
        `;
    }

    function renderizarTabelaOportunidades() {
        return `
            <h1>Consultar Oportunidades</h1>
            <div class="filtros">
                <!-- Filtros aqui -->
                <input type="text" placeholder="Buscar...">
                <button>Aplicar Filtros</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Lead</th>
                        <th>Origem</th>
                        <th>Destino</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-oportunidades-corpo">
                    <!-- Linhas carregadas dinamicamente -->
                    <tr><td colspan="6">Nenhuma oportunidade encontrada.</td></tr>
                </tbody>
            </table>
            <div class="export-buttons">
                <button id="export-excel">Exportar para Excel</button>
                <button id="export-pdf">Exportar para PDF</button>
            </div>
        `;
    }

    // Lógica para mostrar/ocultar campos do formulário de oportunidade baseado no tipo
    mainContent.addEventListener("change", (event) => {
        if (event.target.id === "tipo-oportunidade") {
            const tipo = event.target.value;
            document.getElementById("campos-intragrupo").style.display = tipo === "intragrupo" ? "block" : "none";
            document.getElementById("campos-externa-entrada").style.display = tipo === "externa_entrada" ? "block" : "none";
            document.getElementById("campos-externa-saida").style.display = tipo === "externa_saida" ? "block" : "none";
        }
    });

    // Carregar a view inicial do dashboard
    loadContent("nav-dashboard");
    document.getElementById("nav-dashboard").classList.add("active");

});

