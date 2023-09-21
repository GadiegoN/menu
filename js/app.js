$(document).ready(function () {
    menu.events.init()
})

var menu = {}

var MY_CART = []

var VALUE_CART = 0
var VALUE_DELIVERY = 5

var MY_ADRESS = null
var COMPANY_PHONE = '5534984081905'

menu.events = {
    init: () => {
        menu.methods.getItemsMenu()
        menu.methods.loadReservation()
        menu.methods.contactWhatsApp()
        menu.methods.loadCall()
    }
}

menu.methods = {
    getItemsMenu: (category = 'burgers', seemore = false) => {
        var filter = MENU[category];

        if(!seemore) {
            $("#itemsMenu").html('')
            $("#btnseeMore").removeClass("hidden")
        }

        $.each(filter, (i, e) => {
            let temp = menu.templetes.item
            .replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","))
            .replace(/\${id}/g, e.id)

            if(seemore && i >= 8 && i < 12) {
                $("#itemsMenu").append(temp)
            }

            if(!seemore && i < 8) {
                $("#itemsMenu").append(temp)
            }

        })

        $(".container-menu a").removeClass("active disabled")

        $("#menu-"+ category).addClass("active disabled")
    },

    seeMore: () => {
        var active = $(".container-menu a.active").attr("id").split("menu-")
        menu.methods.getItemsMenu(active[1], true)

        $("#btnseeMore").addClass("hidden")
    },
    
    decreaseQuantityCart: (id) => {
        let quantityItemsCurrently = parseInt($("#quantityCart-" + id).text())

        if (quantityItemsCurrently > 0) {
            $($("#quantityCart-" + id).text(quantityItemsCurrently - 1))
        }
    },

    increaseQuantityCart: (id) => {
        let quantityItemsCurrently = parseInt($("#quantityCart-" + id).text())
        
        if(quantityItemsCurrently <= 9){
            $($("#quantityCart-" + id).text(quantityItemsCurrently + 1))
        }
    },

    addItemCart: (id) => {
        let quantityItemsCurrently = parseInt($("#quantityCart-" + id).text());
    
        if (quantityItemsCurrently > 0) {
            var category = $(".container-menu a.active").attr("id").split("menu-")[1];
            let filter = MENU[category];
            let item = $.grep(filter, (e, i) => { return e.id == id });
    
            if (item.length > 0) {
                let cartContainsItems = $.grep(MY_CART, (elem, index) => { return elem.id === id });
    
                if (cartContainsItems.length > 0) {
                    let objIndex = MY_CART.findIndex((obj => obj.id == id));
                    MY_CART[objIndex].quantity += quantityItemsCurrently;
                } else {
                    item[0].quantity = quantityItemsCurrently;
                    MY_CART.push(item[0]);
                }

                menu.methods.alertMessage(`${item[0].quantity}x ${item[0].name} adicionado ao carrinho!`, 'green');
                $("#quantityCart-" + id).text(0)

                menu.methods.updateBadge()
            }
        }
    },

    updateBadge: () => {
        var total = 0

        $.each(MY_CART, (i, e) => {
            total += e.quantity
        })

        if(total > 0) {
            $(".button-cart").removeClass("hidden")
            $(".container-limit").removeClass("hidden")
        } else {
            $(".button-cart").addClass("hidden")
            $(".container-limit").addClass("hidden")
        }

        $(".badge-total-cart").html(total)
        $(".badge-total-cart-float").html(total)
    },

    openModalCart: (open) => {
        if(open) {
            $('#modalCart').removeClass('hidden')
            menu.methods.loadCart(1)
        } else {
            $('#modalCart').addClass('hidden')
        }
    },

    loadStep: (step) => {
        if(step == 1){
            $('#labelTitleStep').text('Seu carrinho:')
            $('#cartItems').removeClass('hidden')
            $('#placeDelivery').addClass('hidden')
            $('#cartSummary').addClass('hidden')

            $('.step').removeClass('active')
            $('.step-1').addClass('active')

            $('#btnStepDelivery').removeClass('hidden')
            $('#btnStepAddress').addClass('hidden')
            $('#btnStepSummary').addClass('hidden')
            $('#btnBackStep').addClass('hidden')
        }

        if(step == 2) {
            $('#labelTitleStep').text('Endereço de entrega:')
            $('#cartItems').addClass('hidden')
            $('#placeDelivery').removeClass('hidden')
            $('#cartSummary').addClass('hidden')

            $('.step').removeClass('active')
            $('.step-1').addClass('active')
            $('.step-2').addClass('active')

            $('#btnStepDelivery').addClass('hidden')
            $('#btnStepAddress').removeClass('hidden')
            $('#btnStepSummary').addClass('hidden')
            $('#btnBackStep').removeClass('hidden')
        }

        if(step == 3) {
            $('#labelTitleStep').text('Resumo do pedido:')
            $('#cartItems').addClass('hidden')
            $('#placeDelivery').addClass('hidden')
            $('#cartSummary').removeClass('hidden')

            $('.step').removeClass('active')
            $('.step-1').addClass('active')
            $('.step-2').addClass('active')
            $('.step-3').addClass('active')

            $('#btnStepDelivery').addClass('hidden')
            $('#btnStepAddress').addClass('hidden')
            $('#btnStepSummary').removeClass('hidden')
            $('#btnBackStep').removeClass('hidden')
        }
    },

    backStep: () => {
        let step = $(".step.active").length

        menu.methods.loadStep(step - 1)
    },

    loadCart: () => {
        menu.methods.loadStep(1)
        $('#btnStepDelivery').removeClass('disabled')

        if(MY_CART.length > 0) {
            $('#cartItems').html('');
            $.each(MY_CART, (i, e) => {
                let temp = menu.templetes.product
                    .replace(/\${img}/g, e.img)
                    .replace(/\${name}/g, e.name)
                    .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","))
                    .replace(/\${id}/g, e.id)
                    .replace(/\${quantity}/g, e.quantity)

                $('#cartItems').append(temp)

                if((i + 1) == MY_CART.length) {
                    menu.methods.loadvalues()
                }
            })
        } else {
            $('#btnStepDelivery').addClass('disabled')
            $('#cartItems').html('<p class="empty-cart"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio</>')
            
            menu.methods.loadvalues()
        }
    },

    reduceQuantityCart: (id) => {
        let quantityItemsCurrently = parseInt($("#quantityBag-" + id).text())

        if (quantityItemsCurrently > 1) {
            $($("#quantityBag-" + id).text(quantityItemsCurrently - 1))
            menu.methods.updateCart(id, quantityItemsCurrently - 1)
        } else {
            menu.methods.removeItemCart(id)
        }
    },

    extendQuantityCart: (id) => {
        let quantityItemsCurrently = parseInt($("#quantityBag-" + id).text())
        
        if(quantityItemsCurrently <= 99){
            $($("#quantityBag-" + id).text(quantityItemsCurrently + 1))
            menu.methods.updateCart(id, quantityItemsCurrently + 1)
        }
    },

    removeItemCart: (id) => {
        MY_CART = $.grep(MY_CART, (e, i) => {
            return e.id != id
        })

        menu.methods.loadCart()
        menu.methods.updateBadge()
    },

    updateCart: (id, quantity) => {
        let objIndex = MY_CART.findIndex((obj => obj.id == id))

        MY_CART[objIndex].quantity = quantity

        menu.methods.updateBadge()
        menu.methods.loadvalues()
    },

    loadvalues: () => {
        VALUE_CART = 0;

        $('#labelTotalPrice').text('R$ 0,00')
        $('#labelPriceDelivery').text('+ R$ 0,00')
        $('#labelSumPrice').text('R$ 0,00')

        $.each(MY_CART, (i, e) => {
            VALUE_CART += parseFloat(e.price * e.quantity)

            if((i + 1) == MY_CART.length) {
                $('#labelTotalPrice').text(`R$ ${VALUE_CART.toFixed(2).replace('.', ',')}`)
                $('#labelPriceDelivery').text(`+ R$ ${VALUE_DELIVERY.toFixed(2).replace('.', ',')}`)
                $('#labelSumPrice').text(`R$ ${(VALUE_CART + VALUE_DELIVERY).toFixed(2).replace('.', ',')}`)
            }
        })
    },

    loadAddress: () => {
        if(MY_CART.length <= 0) {
            menu.methods.alertMessage('Seu carrinho está vazio')
            return;
        }

        menu.methods.loadStep(2)
    },

    searchZipCode: () => {
        var cep = $('#cep').val().trim().replace(/\D/g, '')

        if(cep != '') {
            var validateCep = /^[0-9]{8}$/

            if(validateCep.test(cep)) {
                $.getJSON(`https://viacep.com.br/ws/${cep}/json/?callback=?`, function (data) {
                    if(!("erro" in data)){
                        $('#adress').val(data.logradouro)
                        $('#district').val(data.bairro)
                        $('#city').val(data.localidade)
                        $('#complement').val(data.complemento)
                        $('#uf').val(data.uf)

                        if(data.logradouro == "") {
                            $('#adress').focus()
                        } else {
                            $('#number').focus()
                        }
                    } else {
                        menu.methods.alertMessage('CEP não encontrado. Verifique novamente!')
                        $('#cep').focus()
                    }
                })

            } else {
                menu.methods.alertMessage('CEP inválido!')
                $('#cep').focus()
            }

        } else {
            menu.methods.alertMessage('Informe o CEP')
            $('#cep').focus()
        }
    },

    requestSummary: () => {
        let cep = $('#cep').val().trim()
        let adress = $('#adress').val().trim()
        let district = $('#district').val().trim()
        let city = $('#city').val().trim()
        let uf = $('#uf').val().trim()
        let complement = $('#complement').val().trim()
        let number = $('#number').val().trim()

        if(cep.length <= 0) {
            menu.methods.alertMessage('CEP não informado!')
            $('#cep').focus()
            return
        }

        if(adress.length <= 0) {
            menu.methods.alertMessage('Endereço não informado!')
            $('#adress').focus()
            return
        }

        if(district.length <= 0) {
            menu.methods.alertMessage('Bairro não informado!')
            $('#district').focus()
            return
        }

        if(city.length <= 0) {
            menu.methods.alertMessage('Cidade não informado!')
            $('#city').focus()
            return
        }

        if(uf == "-1") {
            menu.methods.alertMessage('Estado não informado!')
            $('#uf').focus()
            return
        }

        if(number.length <= 0) {
            menu.methods.alertMessage('Número não informado!')
            $('#number').focus()
            return
        }

        MY_ADRESS = {
            cep,
            adress,
            district,
            city,
            uf,
            number,
            complement,
        }
        
        menu.methods.loadStep(3)
        menu.methods.loadSummary()

    },

    loadSummary: () => {
        $('#listItemSummary').html('')

        $.each(MY_CART, (i, e) => {
            let temp = menu.templetes.itemSummary
                .replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","))
                .replace(/\${quantity}/g, e.quantity)

            $('#listItemSummary').append(temp)

        })

        $('#summaryAddress').html(`${MY_ADRESS.adress}, ${MY_ADRESS.number}, ${MY_ADRESS.district}`)
        $('#cityAddress').html(`${MY_ADRESS.city}, ${MY_ADRESS.uf} / ${MY_ADRESS.cep} ${MY_ADRESS.complement}`)

        menu.methods.finalizeOrder()
    },

    finalizeOrder: () => {
        // https://wa.me/5534984081905?text=ola

        var items = '';

        $.each(MY_CART, (i, e) => {
            items += `*${e.quantity}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`

            if((i + 1) == MY_CART.length) {
                var text = 'Gostaria de fazer um pedido:'
                text += `\n*Itens do pedido:*\n\n${items}`
                text += `\n*Endereço de entrega:*`
                text += `\n${MY_ADRESS.adress}, ${MY_ADRESS.number}, ${MY_ADRESS.district}`
                text += `\n${MY_ADRESS.city}, ${MY_ADRESS.uf} / ${MY_ADRESS.cep} ${MY_ADRESS.complement}`
                text += `\n\n*Total (com entrega): R$ ${(VALUE_CART + VALUE_DELIVERY).toFixed(2).replace('.', ',')}*`
                // return text
            }

            let encode = encodeURI(text)
            let URL = `https://wa.me/${COMPANY_PHONE}?text=${encode}`

            $('#btnStepSummary').attr('href', URL)
        })

    },

    loadReservation: () => {
        var text = 'Gostaria de fazer uma *reserva*'
        let encode = encodeURI(text)
        let URL = `https://wa.me/${COMPANY_PHONE}?text=${encode}`

        $('#btnReservation').attr('href', URL)
    },

    contactWhatsApp: () => {
        let URL = `https://wa.me/${COMPANY_PHONE}`

        $('#btnWhatsApp').attr('href', URL)
        $('#btnWhatsApp-1').attr('href', URL)
    },
 
    loadCall: () => {
        $("#btnCall").attr('href', `tel:${COMPANY_PHONE}`)
    },

    openEvaluation: (evaluation) => {
        $("#evaluation-1").addClass('hidden')
        $("#evaluation-2").addClass('hidden')
        $("#evaluation-3").addClass('hidden')
        
        $("#btnEvaluation-1").removeClass('active')
        $("#btnEvaluation-2").removeClass('active')
        $("#btnEvaluation-3").removeClass('active')

        $("#evaluation-" + evaluation).removeClass('hidden')
        $("#btnEvaluation-" + evaluation).addClass('active')
    },

    alertMessage: (text, color = "red", time = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();
        
        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${color}">${text}</div>`
        
        $("#container-messages").append(msg)

        setTimeout(() => {
            $("#msg-"+ id).removeClass('fadeInDown')
            $("#msg-"+ id).addClass('fadeOutUp')
            setTimeout(() => {
                $("#msg-"+ id).remove()
            }, 800)
        }, time)
    }
}

menu.templetes = {
    item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-12 col-one animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-product">
                    <img
                    src="\${img}"
                    alt=""
                    />
                </div>
                <p class="title-product text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="price-product text-center"><b>R$ \${price}</b></p>
                <div class="add-cart">
                    <span class="btn-less" onclick="menu.methods.decreaseQuantityCart('\${id}')">
                    <i class="fa fa-minus"></i>
                    </span>
                    <span class="btn-number-items" id="quantityCart-\${id}">0</span>
                    <span class="btn-more" onclick="menu.methods.increaseQuantityCart('\${id}')">
                    <i class="fa fa-plus"></i>
                    </span>
                    <span class="btn btn-add" onclick="menu.methods.addItemCart('\${id}')">
                    <i class="fa fa-shopping-bag"></i>
                    </span>
                </div>
            </div>
        </div>
    `,

    product: `
        <div class="col-12 cart-item">
            <div class="img-product">
            <img src="\${img}" alt="">
            </div>
            <div class="product-data">
            <p class="title-product"><b>\${name}</b></p>
            <p class="price-product"><b>R$ \${price}</b></p>
            </div>
            <div class="add-cart">
                <span class="btn-less" onclick="menu.methods.reduceQuantityCart('\${id}')">
                    <i class="fa fa-minus"></i>
                </span>
                <span class="btn-number-items" id="quantityBag-\${id}">\${quantity}</span>
                <span class="btn-more" onclick="menu.methods.extendQuantityCart('\${id}')">
                    <i class="fa fa-plus"></i>
                </span>
                <span class="btn btn-remove" onclick="menu.methods.removeItemCart('\${id}')">
                    <i class="fas fa-times"></i>
                </span>
            </div>
        </div>
    `,

    itemSummary: `
        <div class="col-12 cart-item summary">
            <div class="img-product-summary">
            <img src="\${img}" alt="">
            </div>
            <div class="product-data">
                <p class="title-product-summary"><b>\${name}</b></p>
                <p class="price-product-summary"><b>R$ \${price}</b></p>
            </div>
            <p class="quantity-product-summary">
            x <b>\${quantity}</b>
            </p>
        </div>
    `
}
