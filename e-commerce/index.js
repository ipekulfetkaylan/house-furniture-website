// contentful
const client = contentful.createClient({

    space: "ngezd70cfqbz",

    accessToken: "TUCE_CxlsU9SZeSkdgswKHxpn3ISxYI-u81PIALCDpc"
  });
 
const cartBtn= document.querySelector('.cart-btn');
const closeCartBtn= document.querySelector('.close-cart');
const clearCartBtn= document.querySelector('.clear-cart');
const cartDom= document.querySelector('.cart');
const cartOverlay= document.querySelector('.cart-overlay');
const cartItems= document.querySelector('.cart-items');
const cartTotal= document.querySelector('.cart-total');
const cartContent= document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');
const clearText= document.querySelector('.clear-text')

let cart= [];

let buttonsDom= [];

class Products{
  async getProducts(){
    try{ 
        // get contentful entries
        let contentful= await client.getEntries({
            content_type: 'houseProduct',
        })
        console.log(contentful)
        

        // let result= await fetch('product.json');
        // let data= await result.json();
        
        let products= contentful.items;
       

        products= products.map(item=> {
            const {title, price}= item.fields;
            const {id}= item.sys;
            const image= item.fields.image.fields.file.url;
            return {title, price, id, image}
        })
        return products;
    }catch(error){
        console.log(error)
    }

    }
}

class UI{
    displayProducts(products){
        let result= '';
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="" class="products-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fa-solid fa-cart-shopping"></i>
                        sepete ekle
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price} ???</h4>
            </article>
            
            `
        });

        productsDom.innerHTML= result;
    }

    getBagButtons(){
        const buttons= [...document.querySelectorAll('.bag-btn')];
        buttonsDom= buttons;
        buttons.forEach(button =>{
            let id= button.dataset.id; //butonlar??n id si al??nd?? 
            let inCart= cart.find(item => item.id === id);
            if(inCart){
                button.innerHTML= 'Sepette';
                button.disabled= true;
            }
            button.addEventListener('click',(event)=>{
                    event.target.innerHTML= 'Sepette';
                    event.target.disabled= true;

                    //get product from products
                    let cartItem= {...Storage.getProduct(id), amount:1};
                    console.log(cartItem)

                    //add product to the cart
                    cart= [...cart, cartItem];
                    console.log(cart)

                    //save cart in local storage
                    Storage.saveCart(cart)

                    //set card values
                    this.setCartValues(cart);     

                    //display cart item
                    this.addCartItem(cartItem);


                    //show the cart
                    this.showCart()

            })
        })
    }
    setCartValues(cart){
        let tempTotal= 0;
        let itemsTotal= 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerHTML= tempTotal;
        cartItems.innerHTML= itemsTotal;
    }
    addCartItem(item){
        const div= document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML= `
        <img src=${item.image} alt="">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>sil</span>
                    </div>
                    <div>
                        <i class="fa-solid fa-chevron-up" data-id=${item.id}></i>
                        <div class="item-amount">${item.amount}</div>
                        <i class="fa-solid fa-chevron-down"  data-id=${item.id}></i>
                    </div>
        `
        cartContent.appendChild(div);
        clearText.classList.remove('show');
        clearCartBtn.innerHTML= 't??m??n?? sil'
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart')
    }

    setUpApp(){
      cart= Storage.getCart();
      this.setCartValues(cart);  
      this.populateCart(cart);
      cartBtn.addEventListener('click', this.showCart);
      closeCartBtn.addEventListener('click', this.hideCart)
    }
 
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));

    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }
    cartLogic(){
        //clear cart
        clearCartBtn.addEventListener('click', ()=> {
            this.clearCart()
        });

        //cart function
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem= event.target;
                let id= removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id); 
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount= event.target;
                let id= addAmount.dataset.id;
                let tempItem= cart.find(item => item.id === id);
                tempItem.amount= tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerHTML= tempItem.amount;
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount= event.target;
                let id= lowerAmount.dataset.id;
                let tempItem= cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount -1;

                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerHTML= tempItem.amount;

                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }
    clearCart(){
        let cartItems= cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        clearText.classList.add('show');
        clearCartBtn.innerHTML= 'Al????veri??e ba??la'
        
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
    }
    removeItem(id){
         cart= cart.filter(item => item.id !== id);
         this.setCartValues(cart);
         Storage.saveCart(cart);
         let button= this.getSingleButton(id);
         button.disabled= false;
         button.innerHTML= ` <i class="fa-solid fa-cart-shopping"></i>
         sepete ekle`;
    }
    getSingleButton(id){
        return buttonsDom.find(button => button.dataset.id === id);
    }

}

class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products))
    }

    static getProduct(id){
        let products= JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id ===id)
    }

    static saveCart(){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ?  JSON.parse(localStorage.getItem('cart')): [];
    }

}

document.addEventListener('DOMContentLoaded', ()=>{
   const ui= new UI();
   const products= new Products();

   //set up
   ui.setUpApp();

   products.getProducts().then(products => {
    ui.displayProducts(products) ;
    Storage.saveProducts(products);
  }).then(()=> {
     ui.getBagButtons();
     ui.cartLogic();
  });

})
