const SUPABASE_URL = "https://kxxonkbrdlwpcmqymxjk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eG9ua2JyZGx3cGNtcXlteGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODgxNTUsImV4cCI6MjA2MjY2NDE1NX0.zU8lkYlfwSlVJlTH548W_TyB9t81Yd038wj9UkCIZTQ";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções de Autenticação
async function handleUserSignUp(event) {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const nome = document.getElementById("signup-nome").value;

    if (!email || !password || !nome) {
        alert("Por favor, preencha todos os campos para se registrar.");
        return;
    }
    if (password.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { 
                    full_name: nome 
                } // Adiciona metadados ao usuário no Supabase Auth
            }
        });

        if (authError) {
            console.error("Erro no registro:", authError);
            alert(`Erro no registro: ${authError.message}`);
            return;
        }

        if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
             alert("Registro realizado! Por favor, verifique seu e-mail para confirmar sua conta antes de fazer login.");
             document.getElementById("form-signup").reset();
             document.getElementById("form-signup").style.display = "none";
             document.getElementById("signup-message").style.display = "none";
             document.getElementById("form-login").style.display = "block";
             return;
        }
        
        // Se a confirmação de email não estiver habilitada, o usuário já estará logado.
        // E também, se o usuário já existir mas não estiver confirmado, o Supabase pode retornar um usuário sem erro.
        // A lógica abaixo assume que a confirmação de e-mail está habilitada.
        alert("Registro realizado! Por favor, verifique seu e-mail para confirmar sua conta antes de fazer login.");
        document.getElementById("form-signup").reset();
        // Opcional: Criar perfil na tabela public.usuarios aqui, se necessário, usando authData.user.id
        // Exemplo: await supabase.from("usuarios").insert({ id_usuario_auth: authData.user.id, nome_usuario: nome, email_usuario: email });

    } catch (err) {
        console.error("Erro inesperado no registro:", err);
        alert("Ocorreu um erro inesperado durante o registro.");
    }
}

async function handleUserLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Por favor, preencha email e senha para entrar.");
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Erro no login:", error);
            alert(`Erro no login: ${error.message}`);
            return;
        }

        console.log("Login bem-sucedido:", data.user);
        // O onAuthStateChange cuidará de atualizar a UI
        // currentUser = data.user;
        // updateUIForAuthenticatedUser();

    } catch (err) {
        console.error("Erro inesperado no login:", err);
        alert("Ocorreu um erro inesperado durante o login.");
    }
}

async function handleUserLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro no logout:", error);
        alert(`Erro no logout: ${error.message}`);
    }
    // O onAuthStateChange cuidará de atualizar a UI
    // currentUser = null;
    // updateUIForLoggedOutUser();
}

function updateUIBasedOnAuthState(user) {
    const authContainer = document.getElementById("auth-container");
    const appContainer = document.getElementById("app-container");
    const userInfoDisplay = document.getElementById("user-info");

    if (user) {
        currentUser = user;
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        userInfoDisplay.textContent = `Usuário: ${user.email}`;
        // Carregar dados iniciais do dashboard para usuário logado
        loadContent("nav-dashboard"); 
        document.getElementById("nav-dashboard").classList.add("active");
        // Popular selects que dependem de dados do banco
        fetchEmpresasGrupo();
        fetchStatusOportunidade();
        fetchParceirosExternos();
        // Adicionar event listener ao formulário de oportunidade APÓS o usuário estar logado e o form ser renderizado
        // Isso é importante porque o formulário só é adicionado ao DOM quando a view é carregada.
        // Uma abordagem melhor seria adicionar o listener quando o formulário é renderizado.
        setTimeout(() => { // Usando setTimeout como um hack rápido, idealmente faria isso no callback de loadContent
            const formOportunidade = document.getElementById("form-oportunidade");
            if (formOportunidade) {
                formOportunidade.removeEventListener("submit", handleSalvarOportunidade); // Evitar múltiplos listeners
                formOportunidade.addEventListener("submit", handleSalvarOportunidade);
            }
        }, 0);

    } else {
        currentUser = null;
        authContainer.style.display = "block";
        appContainer.style.display = "none";
        userInfoDisplay.textContent = "Usuário: Desconectado";
        document.getElementById("form-login").reset();
        document.getElementById("form-signup").reset();
    }
}

// Variáveis globais para elementos de autenticação e app
let currentUser = null;

// Função para lidar com o submit do formulário de oportunidade
async function handleSalvarOportunidade(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const dadosOportunidade = Object.fromEntries(formData.entries());

    console.log("Dados do formulário para salvar:", dadosOportunidade);

    // Validações básicas (podem ser mais robustas)
    if (!dadosOportunidade.nome_empresa_lead || !dadosOportunidade.nome_contato_lead || 
        !dadosOportunidade.email_lead || !dadosOportunidade.telefone_lead || 
        !dadosOportunidade.data_envio_recebimento || !dadosOportunidade.id_responsavel_envio_recebimento || 
        !dadosOportunidade.id_status_atual || !dadosOportunidade.tipo_oportunidade) {
        alert("Por favor, preencha todos os campos obrigatórios do lead e da oportunidade.");
        return;
    }

    try {
        // 1. Criar o Lead
        const { data: leadData, error: leadError } = await supabase
            .from("leads")
            .insert({
                nome_empresa_lead: dadosOportunidade.nome_empresa_lead,
                nome_contato_lead: dadosOportunidade.nome_contato_lead,
                email_lead: dadosOportunidade.email_lead,
                telefone_lead: dadosOportunidade.telefone_lead
            })
            .select()
            .single(); // .single() para retornar o objeto inserido, não um array

        if (leadError) {
            console.error("Erro ao criar lead:", leadError);
            alert(`Erro ao criar lead: ${leadError.message}`);
            return;
        }
        console.log("Lead criado:", leadData);
        const idLeadCriado = leadData.id_lead;

        // 2. Preparar dados da Oportunidade
        const oportunidadePayload = {
            id_lead: idLeadCriado,
            tipo_oportunidade: dadosOportunidade.tipo_oportunidade,
            data_envio_recebimento: dadosOportunidade.data_envio_recebimento,
            id_responsavel_envio_recebimento: parseInt(dadosOportunidade.id_responsavel_envio_recebimento), // Garantir que é int
            id_status_atual: parseInt(dadosOportunidade.id_status_atual), // Garantir que é int
            // Campos condicionais serão adicionados abaixo
        };

        let parceirosDestinoExternoIds = [];

        if (dadosOportunidade.tipo_oportunidade === "intragrupo") {
            if (!dadosOportunidade.id_empresa_origem_grupo || !dadosOportunidade.id_empresa_destino_grupo) {
                alert("Para oportunidade intragrupo, empresa de origem e destino são obrigatórias.");
                // Poderia reverter a criação do lead aqui ou tratar de outra forma
                return;
            }
            if (dadosOportunidade.id_empresa_origem_grupo === dadosOportunidade.id_empresa_destino_grupo) {
                alert("Empresa de origem e destino não podem ser a mesma para intragrupo.");
                return;
            }
            oportunidadePayload.id_empresa_origem_grupo = parseInt(dadosOportunidade.id_empresa_origem_grupo);
            oportunidadePayload.id_empresa_destino_grupo = parseInt(dadosOportunidade.id_empresa_destino_grupo);
        } else if (dadosOportunidade.tipo_oportunidade === "externa_entrada") {
            if (!dadosOportunidade.id_parceiro_origem_externo || !dadosOportunidade.id_empresa_destino_grupo_entrada) {
                alert("Para oportunidade externa (entrada), parceiro de origem e empresa de destino (grupo) são obrigatórios.");
                return;
            }
            oportunidadePayload.id_parceiro_origem_externo = parseInt(dadosOportunidade.id_parceiro_origem_externo);
            oportunidadePayload.id_empresa_destino_grupo = parseInt(dadosOportunidade.id_empresa_destino_grupo_entrada);
        } else if (dadosOportunidade.tipo_oportunidade === "externa_saida") {
            if (!dadosOportunidade.id_empresa_origem_grupo_saida || !formData.getAll("parceiros_destino_externo_ids").length) {
                alert("Para oportunidade externa (saída), empresa de origem (grupo) e ao menos um parceiro de destino são obrigatórios.");
                return;
            }
            oportunidadePayload.id_empresa_origem_grupo = parseInt(dadosOportunidade.id_empresa_origem_grupo_saida);
            parceirosDestinoExternoIds = formData.getAll("parceiros_destino_externo_ids").map(id => parseInt(id));
        }

        // 3. Criar a Oportunidade
        const { data: oportunidadeData, error: oportunidadeError } = await supabase
            .from("oportunidades")
            .insert(oportunidadePayload)
            .select()
            .single();

        if (oportunidadeError) {
            console.error("Erro ao criar oportunidade:", oportunidadeError);
            alert(`Erro ao criar oportunidade: ${oportunidadeError.message}`);
            // Considerar deletar o lead criado se a oportunidade falhar
            return;
        }
        console.log("Oportunidade criada:", oportunidadeData);
        const idOportunidadeCriada = oportunidadeData.id_oportunidade;

        // 4. Lidar com múltiplos parceiros de destino para "externa_saida"
        if (dadosOportunidade.tipo_oportunidade === "externa_saida" && parceirosDestinoExternoIds.length > 0) {
            const insertsParceirosDestino = parceirosDestinoExternoIds.map(idParceiro => ({
                id_oportunidade: idOportunidadeCriada,
                id_parceiro_destino_externo: idParceiro
            }));
            const { error: relError } = await supabase
                .from("oportunidades_parceiros_destino_externo")
                .insert(insertsParceirosDestino);
            if (relError) {
                console.error("Erro ao associar parceiros de destino:", relError);
                alert(`Erro ao associar parceiros de destino: ${relError.message}`);
                // Considerar rollback mais complexo aqui
                return;
            }
            console.log("Parceiros de destino associados.");
        }

        // 5. Registrar histórico inicial (simples)
        const { error: histError } = await supabase
            .from("historico_alteracoes_oportunidade")
            .insert({
                id_oportunidade: idOportunidadeCriada,
                id_usuario_modificacao: parseInt(dadosOportunidade.id_responsavel_envio_recebimento), // Usar o ID do usuário logado no futuro
                campo_modificado: "Criação da Oportunidade",
                valor_novo: `Oportunidade criada com status ID: ${dadosOportunidade.id_status_atual}`
            });
        
        if (histError) {
            console.warn("Erro ao registrar histórico:", histError); // Não bloquear por isso, mas logar
        }

        alert("Oportunidade registrada com sucesso!");
        form.reset();
        // Atualizar a visualização de oportunidades, se estiver visível
        if (document.getElementById("tabela-oportunidades-corpo")) {
            // Idealmente, chamar uma função que recarrega a tabela
            loadContent("nav-consultar-oportunidades"); 
        }

    } catch (err) {
        console.error("Erro inesperado ao salvar oportunidade:", err);
        alert("Ocorreu um erro inesperado. Verifique o console para mais detalhes.");
    }
}

// Função para buscar parceiros externos
async function fetchParceirosExternos() {
    console.log("Buscando parceiros externos...");
    try {
        const { data, error } = await supabase
            .from("parceiros_externos")
            .select("*");

        if (error) {
            console.error("Erro ao buscar parceiros externos:", error);
            return [];
        }
        console.log("Parceiros externos encontrados:", data);
        const selectParceiroOrigem = document.getElementById("parceiro-origem");
        const selectParceirosDestino = document.getElementById("parceiros-destino");

        if (selectParceiroOrigem) {
            selectParceiroOrigem.innerHTML = 	à<option value=\"\">Selecione...</option>
            data.forEach(parceiro => {
                const option = document.createElement("option");
                option.value = parceiro.id_parceiro_externo;
                option.textContent = parceiro.nome_parceiro;
                selectParceiroOrigem.appendChild(option.cloneNode(true));
                if (selectParceirosDestino) selectParceirosDestino.appendChild(option.cloneNode(true));
            });
        }
        return data;
    } catch (err) {
        console.error("Erro inesperado ao buscar parceiros externos:", err);
        return [];
    }
}

// Função para buscar status de oportunidade
async function fetchStatusOportunidade() {
    console.log("Buscando status de oportunidade...");
    try {
        const { data, error } = await supabase
            .from("status_oportunidade")
            .select("*");

        if (error) {
            console.error("Erro ao buscar status de oportunidade:", error);
            return [];
        }
        console.log("Status de oportunidade encontrados:", data);
        const selectStatus = document.getElementById("status-oportunidade");
        if (selectStatus) {
            selectStatus.innerHTML = 	à<option value=\"\">Selecione...</option>
            data.forEach(status => {
                const option = document.createElement("option");
                option.value = status.id_status;
                option.textContent = status.nome_status;
                selectStatus.appendChild(option);
            });
        }
        return data;
    } catch (err) {
        console.error("Erro inesperado ao buscar status:", err);
        return [];
    }
}

// Função para buscar empresas do grupo
async function fetchEmpresasGrupo() {
    console.log("Buscando empresas do grupo...");
    try {
        const { data, error } = await supabase
            .from("empresas_grupo")
            .select("*");

        if (error) {
            console.error("Erro ao buscar empresas do grupo:", error);
            return [];
        }
        console.log("Empresas do grupo encontradas:", data);
        // Exemplo: popular um select no formulário (se existir um com id="empresa-origem-grupo")
        const selectOrigem = document.getElementById("empresa-origem-grupo");
        const selectDestino = document.getElementById("empresa-destino-grupo");
        const selectOrigemSaida = document.getElementById("empresa-origem-grupo-saida");
        const selectDestinoEntrada = document.getElementById("empresa-destino-grupo-entrada");

        if (selectOrigem) {
            data.forEach(empresa => {
                const option = document.createElement("option");
                option.value = empresa.id_empresa_grupo;
                option.textContent = empresa.nome_empresa;
                selectOrigem.appendChild(option.cloneNode(true));
                if (selectDestino) selectDestino.appendChild(option.cloneNode(true));
                if (selectOrigemSaida) selectOrigemSaida.appendChild(option.cloneNode(true));
                if (selectDestinoEntrada) selectDestinoEntrada.appendChild(option.cloneNode(true));
            });
        }
        return data;
    } catch (err) {
        console.error("Erro inesperado ao buscar empresas:", err);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");
    const formSignup = document.getElementById("form-signup");
    const logoutButton = document.getElementById("logout-button");
    const showSignupLink = document.getElementById("show-signup");
    const showLoginLink = document.getElementById("show-login");

    const navLinks = document.querySelectorAll(".sidebar ul li a");
    const mainContent = document.getElementById("main-content");
    const dropdownToggles = document.querySelectorAll(".sidebar .dropdown-toggle");

    // Auth Listeners
    formLogin.addEventListener("submit", handleUserLogin);
    formSignup.addEventListener("submit", handleUserSignUp);
    logoutButton.addEventListener("click", handleUserLogout);

    showSignupLink.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("form-login").style.display = "none";
        document.getElementById("form-signup").style.display = "block";
        document.getElementById("signup-message").style.display = "block";
    });

    showLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("form-signup").style.display = "none";
        document.getElementById("signup-message").style.display = "none";
        document.getElementById("form-login").style.display = "block";
    });

    // Listen for Supabase auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth event:", event, "Session:", session);
        const user = session ? session.user : null;
        updateUIBasedOnAuthState(user);
    });

    // Dropdown functionality
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

