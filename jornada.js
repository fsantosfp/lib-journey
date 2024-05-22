const matrizFields = ["nivel_completude", "codigo_metodo_confirmacao_completude", "codigo_fonte_confirmacao_completude"];
const commonFields = {"nome_completo": 105, "documento_originacao":700}
const legalPersonFields = {"atividade_economica_principal":160, "endereco.cartao_cnpj":3001405}
const naturalPersonFields = {"telefone.pessoal":5001401,"parentesco.conjuge":600502598, "nome_fantasia":153}

function addFormFields(){

    const form = document.getElementById("fields");

    for(const [key, value] of Object.entries(commonFields) ){
        let formGroup = createGroup(key, value)
        let nestedInput = nestedInputs(key)
        formGroup.appendChild(nestedInput)
        form.appendChild(formGroup)
        manageCheckbox(key, `${key}_inputs`)
    }
}

function createGroup(fieldName, code){
    let group = document.createElement("div")
        group.className = "form-group form-inline"
        group.setAttribute("data-domainName", fieldName)
        group.setAttribute("data-domainCode",code)

    let id = fieldName
    let input = createInput(id, "checkbox")
    let label = createLabel(fieldName, id)

    group.appendChild(input)
    group.appendChild(label)

    return group
}

function createInput(id, type, isDisable = false, placeholder = ""){
    let input = document.createElement("input")
    input.type = type
    input.id = id
    input.disabled = isDisable
    input.setAttribute("placeholder", placeholder)
    return input
}

function createLabel(fieldName, idInput){
    let label = document.createElement("label");
    label.innerHTML = fieldName;
    label.setAttribute("for", idInput)
    return label
}

function nestedInputs(fieldName){

    let nested = document.createElement("div")
        nested.className = "nested-inputs"
        nested.id = `${fieldName}_inputs`

    for( let i = 0; i < matrizFields.length; i++){
        let div = document.createElement("div")
        let id = `${fieldName}_${matrizFields[i]}`
        let input = createInput(id, "text", true, matrizFields[i])
        div.appendChild(input)
        nested.appendChild(div)
    }

    return nested

}

function manageCheckbox(checkboxId, inputGroupId) {
    document.getElementById(checkboxId).addEventListener('change', function() {
        const inputGroup = document.getElementById(inputGroupId);
        const inputs = inputGroup.querySelectorAll('input');
        if (this.checked) {
            inputGroup.style.display = 'flex';
            inputs.forEach(input => {
                input.disabled = false;
            });
        } else {
            inputGroup.style.display = 'none';
            inputs.forEach(input => {
                input.disabled = true;
                input.value = ''; // Limpa o conteúdo dos inputs
            });
        }
    });
}

function createSqlCommand(journeyValues, fieldValues){
    
    let sql = ""
    const tbeq3156_conlumns = 'cod_matz_cadl_jorn, cod_tipo_dado_cadl_pess, cod_font_cfmc_cmde_cadl, cod_nive_cfbl_vali_cmde,cod_meto_cfmc_cmde_cadl, ind_vldo_cmde, ind_camo_crti'
    const tbeq3161_conlumns = ''
    const tbeq3162_conlumns = ''

    const is_critico = values.is_critico ? 1 : 0;
    const is_valida_completude = values.is_valida_completude ? 1 : 0;

    if(document.getElementById("nova_jornada").checked){
        sql += `INSERT INTO cadastroconfigs.tbeq3156_cnfg_matz_cadl (${columns}) VALUES ('${matriz}',${fieldValues.field_code},${fieldValues.codigo_fonte_confirmacao_completude},${fieldValues.nivel_completude},${fieldValues.codigo_metodo_confirmacao_completude},${is_valida_completude},${is_critico});\n`
    }

    sql += `-- ${values.field_name.toUpperCase()}\n`
    sql += `INSERT INTO cadastroconfigs.tbeq3156_cnfg_matz_cadl (${tbeq3156_conlumns}) VALUES ('${matriz}',${fieldValues.field_code},${fieldValues.codigo_fonte_confirmacao_completude},${fieldValues.nivel_completude},${fieldValues.codigo_metodo_confirmacao_completude},${is_valida_completude},${is_critico});\n`
    
    console.log(sql)

    return sql
}

function createHSET(data){
    let hset = `-- HSET "EQ3_JOURNEY" "${data.id_jornada}" "${JSON.stringify(data).replaceAll('"','"\\')}"`
    console.log(hset)
}


document.getElementById('sqlForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let sql = '';
    const journey = document.getElementById("id_jornada").value
    const matriz = document.getElementById("id_matriz").value
    
    const data = {
        id_jornada: journey,
        id_matriz: matriz,
        tenantId: "abc",
        matriz: {
            fields:[]
        }
    }

    document.querySelectorAll('input[type="checkbox"]:checked').forEach((element) => {
    
        const values = {
            field_code: element.parentNode.dataset['domaincode'],
            field_name: element.parentNode.dataset['domainname'],
            codigo_fonte_confirmacao_completude: document.getElementById(`${element.id}_codigo_fonte_confirmacao_completude`).value,
            nivel_completude: document.getElementById(`${element.id}_nivel_completude`).value,
            codigo_metodo_confirmacao_completude: document.getElementById(`${element.id}_codigo_metodo_confirmacao_completude`).value,
            is_critico: false,
            is_valida_completude: true,
        }
    
        data.matriz.fields.push(values)
        sql += createSqlCommand({journey, matriz, tenantId}, values)    
    })

    createHSET(data)

    // const blob = new Blob([sql], {type: 'text/sql'});

    // const a = document.createElement('a')
    // a.href = URL.createObjectURL(blob)
    // a.download = "jornada.sql"
    // a.style.display = 'none'
    // document.body.appendChild(a)
    // a.click()

    // document.body.removeChild(a)

    const eventChange = new Event('change')
    const element = document.getElementById("nova_jornada")
    element.checked = true
    element.dispatchEvent(eventChange)


})

document.getElementById("journey_form").addEventListener('submit', function(event){
    event.preventDefault();

    const jornada = JSON.parse(document.getElementById("jornada").value)

    document.getElementById("id_jornada").value = jornada.id_jornada
    document.getElementById("id_matriz").value = jornada.id_matriz
    document.getElementById("nome_jornada_consumidor").value = jornada.nome_jornada_consumidor

    setFields(jornada.matriz.fields)

    document.getElementById('reaproveitar_jornada').classList.add('hidden');
    document.getElementById("jornada").value = ""
    
})

function setFields(fields){

    const event = new Event('change')

    fields.forEach((data) => {
        console.log(data)
        let element = document.getElementById(data.field_name)

        if( element == undefined ){       
            const form = document.getElementById("fields");     
            let formGroup = createGroup(data.field_name, data.field_code)
            let nestedInput = nestedInputs(data.field_name)
            formGroup.appendChild(nestedInput)
            form.appendChild(formGroup)
            manageCheckbox(data.field_name, `${data.field_name}_inputs`)
            element = document.getElementById(data.field_name)
        }
        
        level = document.getElementById(`${data.field_name}_nivel_completude`)
        source = document.getElementById(`${data.field_name}_codigo_fonte_confirmacao_completude`)
        method = document.getElementById(`${data.field_name}_codigo_metodo_confirmacao_completude`)
        level.value = data.nivel_completude
        source.value = data.codigo_fonte_confirmacao_completude
        method.value = data.codigo_metodo_confirmacao_completude
        element.checked = true

        
        element.dispatchEvent(event);  
        level.disabled = true
        source.disabled = true
        method.disabled = true
    })
}

function handleJourneyChange(event) {

    if (event.target.value === 'use_jornada') {
        document.getElementById('reaproveitar_jornada').classList.remove('hidden');
        document.getElementById("jornada").value = ""
        document.getElementById("id_jornada").disabled = true
        document.getElementById("id_matriz").disabled = true
        document.getElementById("nome_jornada_consumidor").disabled = true
    } else {
        const event = new Event('change')
        document.getElementById('reaproveitar_jornada').classList.add('hidden');
        document.querySelectorAll('#sqlForm input').forEach((element) => {
            element.disabled = false;
            element.value = ""
        })
        document.querySelectorAll('input[type="checkbox"]:checked').forEach((element) => {
            element.checked = false
            element.dispatchEvent(event)
        })
        
        let notCommon = {}
        Object.assign(notCommon, naturalPersonFields)
        Object.assign(notCommon, legalPersonFields)

        for(const [key, value] of Object.entries(notCommon)){
            const element = document.querySelector(`[data-domainname="${key}"]`)
            if(element != undefined) element.remove()
        }

        const personType = document.querySelector('input[name="tipo_pessoa"]:checked')
        if(personType != undefined) personType.checked = false

    }
}

function handlePersonTypeChange(event) {

    const remove = event.target.value === "pf" ? legalPersonFields : naturalPersonFields
    const add = event.target.value === "pf" ? naturalPersonFields : legalPersonFields

    for(const [key, value] of Object.entries(remove)){
        const element = document.querySelector(`[data-domainname="${key}"]`)
        if(element != undefined) element.remove()
    }

    const form = document.getElementById("fields");
    for(const [key, value] of Object.entries(add) ){
        let formGroup = createGroup(key, value)
        let nestedInput = nestedInputs(key)
        formGroup.appendChild(nestedInput)
        form.appendChild(formGroup)
        manageCheckbox(key, `${key}_inputs`)
    }

}

document.querySelectorAll('input[name="teste"]').forEach(radio => {
    radio.addEventListener('change', handleJourneyChange);
});
document.querySelectorAll('input[name="tipo_pessoa"]').forEach(radio => {
    radio.addEventListener('change', handlePersonTypeChange);
});
addFormFields();