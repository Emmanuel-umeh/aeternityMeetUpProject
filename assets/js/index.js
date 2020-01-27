const contractSource = `
contract LifeHack =
  
    
  record hackUser = 
    {
    creatorAddress : address,
    imageUrl : string,
    name : string,
    tutorial : string,
    like : bool,
    likeCount : int
    }
    
  record state = {
    hack : map(int, hackUser),
    hackLength : int,
    likeCount : int}
    
  entrypoint init() = { 
    hack = {},
    hackLength = 0,
    likeCount = 0}

  
  entrypoint getHack(index : int) = 
    switch(Map.lookup(index, state.hack))
      None => abort("Product does not exist with this index")
      Some(x) => x  
    
    
    //create a life hack
    
  stateful entrypoint writeHack( imageUrl' : string, name' : string, tutorial' : string) = 
    let hackUser = {
      creatorAddress  = Call.caller,
      imageUrl = imageUrl',
      name = name', 
      tutorial = tutorial',
      like = false,
      likeCount = state.likeCount
      
      }
    let index = getHackLength() + 1
    put(state{hack[index] = hackUser, hackLength = index})
    
    
    //returns lenght of life hacks registered
  entrypoint getHackLength() : int = 
    state.hackLength
    
  //returns number of likes
    
  entrypoint getlikeCount(index : int) = 
    state.likeCount 
    
    //like a lifehack
    
  stateful entrypoint likeLifeHack(index : int) = 
    let product = getHack(index)
    let addlike = getlikeCount(index : int) + 1
    //let hackUser = {
      //creatorAddress  = product.creatorAddress,
      //imageUrl = product.imageUrl,
      //name = product.name, 
      //tutorial = product.tutorial,
      //like = product.like,
      //likeCount = product.likeCount+1}
    put(state{likeCount = addlike})  
    "LIfe Hack has BEEN LIKED SUCCESSFULLY"
  
    
  
    `; 


const contractAddress = 'ct_VbEoGN6kdTV3QyMPuDfkPgn794Bbc69gjgzwM6b8952nQrTeF';
var HackArray = [];
var client = null;
var hackLength = 0;



function renderProduct()
{
    HackArray = HackArray.sort(function(a,b){return b.Price - a.Price})
    var template = $('#template').html();
    
    Mustache.parse(template);
    var rendered = Mustache.render(template, {HackArray});

    
  

    $('#body').html(rendered);
    console.log("for loop reached")
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  console.log("Contract : ", contract)
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  console.log("Called get found: ",  calledGet)
  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("catching errors : ", decodedGet)
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  $("#loadings").show();

  client = await Ae.Aepp()

  hackLength = await callStatic('getHackLength', []); 
  

  for(let i = 1; i<= hackLength ; i++ ){
    const Hacks =  await callStatic('getHack', [i]);
    
    console.log("for loop reached", "pushing to array")
    console.log(Hacks.imageUrl)
    console.log(Hacks.name)
    console.log(Hacks.tutorial)
    

    HackArray.push({
        imageUrl : Hacks.imageUrl,
        name : Hacks.name, 
        tutorial : Hacks.tutorial,
        numberOfLikes : 0,
        

     
  })

  // Like a post
  $(function(){
    $(document).on('click', '.like-review', function(e) {
      $(this).html('<i class="fa fa-heart" aria-hidden="true"></i> You liked this');
      $(this).children('.fa-heart').addClass('animate-like');

      update = HackArray.numberOfLikes + 1

      HackArray.push({
      
          numberOfLikes : update
      }) 
      
    });
});
}
  renderProduct();
  $("#loadings").hide();
});



$('#regButton').click(async function(){
  $("#loadings").show();

    var name =($('#name').val()),
    
    url = ($('#imageUrl').val()),
   
    tutorial = ($('#lifeHack').val());
    await contractCall('writeHack', [url,name,tutorial], 0)
   
    console.log(url)
    console.log(name)
    console.log(tutorial)

   

    
    HackArray.push({
        name : name,
        url : url,
        tutorial : tutorial,
        numberOfLikes : 0

        
        
    })
    renderProduct();
    location.reload(true);
    $("#loadings").hide();
    name.value =""
    url.value =  ""
    tutorial.value = ""
});


