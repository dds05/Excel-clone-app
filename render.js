

// jquery to maipulate dom
const dialog=require('electron').remote.dialog;
const fs=require("fs");
const $=require("jquery");

$(document).ready(function () { 
    window.db=[];
    init();

    $("#font-family-container").on("change", function () {
        let fontFamily = $(this).val();
        let address = $("#address").val();
        let { rid, cid } = getrcidfromaddress(address);
        db[rid][cid].fontFamily = fontFamily;
        $(`.cell[rid=${rid}][cid=${cid}]`).css("font-family", fontFamily);
    })
    $("#font-size").on("change", function () {
        let fontSize = $(this).val();
        let address = $("#address").val();
        let { rid, cid } = getrcidfromaddress(address);
        db[rid][cid].fontSize = fontSize;
        $(`.cell[rid=${rid}][cid=${cid}]`).css("font-size", fontSize + "px");
    })

    $('#underline').on("click", function () {
        $(this).toggleClass('selected');
        let underline = $(this).hasClass('selected');
        let address = $("#address").val();

        let { rid, cid } = getrcidfromaddress(address);
        db[rid][cid].underline = underline;
        $(`.cell[rid=${rid}][cid=${cid}]`).css("text-decoration", underline ? "underline" : "none");
    })
    $('#italic').on("click", function () {
        $(this).toggleClass('selected');
        let address = $("#address").val();
        let italic = $(this).hasClass('selected');
        let { rid, cid } = getrcidfromaddress(address);
        db[rid][cid].italic = italic
        $(`.cell[rid=${rid}][cid=${cid}]`).css("font-style", italic ? "italic" : "normal");
    })
    $('#bold').on("click", function () {
        $(this).toggleClass('selected');
        let address = $("#address").val();
        let { rid, cid } = getrcidfromaddress(address);
        let bold = $(this).hasClass('selected');
        $(`.cell[rid=${rid}][cid=${cid}]`).css("font-weight", bold ? "bolder" : "normal");
        db[rid][cid].bold = bold;
    })
    $("#bg-color").on("change", function () {
        let bgColor = $(this).val();
        let address = $("#address").val();
        let { rid, cid } = getrcidfromaddress(address);
        db[rid][cid].bgColor = bgColor;
        $(`.cell[rid=${rid}][cid=${cid}]`).css("background-color", bgColor);
    })
    $("#text-color").on("change", function () {
        let color = $(this).val();
        let address = $("#address").val();
        let { rid, cid } = getrcidfromaddress(address);
        db[rid][cid].color = color;
        $(`.cell[rid=${rid}][cid=${cid}]`).css("color", color);
    })
    $('[halign]').on('click', function () {
        $('[halign]').removeClass('selected');
        $(this).addClass('selected');
        let address = $("#address").val();
        let { rid, cid } = getrcidfromaddress(address);
        let halign = $(this).attr('halign');
        db[rid][cid].halign = halign;
        $(`.cell[rid=${rid}][cid=${cid}]`).css("text-align", halign);
    })

    $(".grid .row .cell").on("click", function () {
        let clickedcell = this;
        let {rid,cid}=getrcidfromcell(clickedcell);
        let address=getaddressfromridcid(rid,cid);
        //let row = Number(rid) + 1;
        //let col = String.fromCharCode(Number(cid) + 65);
        //let address = col + row;
        //console.log(address, "was clicked");
        //address display
        $("#address").val(address);

        //formula change 
        
        let isEmpty=db[rid][cid].isEmpty;
        let val=db[rid][cid].val;
        $("#formula").val(db[rid][cid].formula);
       
        
        

    })

     //get row id and col id from cell
    function getrcidfromcell(clickedcell)
    {
        let rid = $(clickedcell).attr("rid");
        let cid = $(clickedcell).attr("cid");
        return{rid:rid, cid:cid};
    }
    
    //update database
    $(".grid .row .cell").on("blur", function () {
        let clickedcell = this;
        let {rid,cid}=getrcidfromcell(clickedcell);
      
        

        if(db[rid][cid].val==$(clickedcell).text())
        return;

        if(db[rid][cid].formula)
        deleteformula(db[rid][cid].formula,rid,cid);
        
        let value=$(clickedcell).text();
        updateUI(value,rid,cid);

        let pixel=$("#font-size").val();
        let cell=$(`.cell[rid=${rid}][cid=${cid}]`);
        cell.css("font-size", pixel + 'px');


        //console.log(address, "was blurred");
        
    })


    /*formula*///////////////////////////////////////////////
    $("#formula").on("blur",function(){
        let formulale=$(this);
        if(formulale.val()=="")
        return;

        let formula=$("#formula").val();
        let address=$("#address").val();

        let{rid,cid}= getrcidfromaddress(address);

        if(db[rid][cid].formula)
        deleteformula(db[rid][cid].formula,rid,cid);

     
        
        // set the formula at which formula is placed
        
        //db>update formula
        setformula(rid,cid,formula,address);
        //evaluate formula

        

        let value=evaluateformula(formula);
        //console.log(value);

        //UI update
        db[rid][cid]
        updateUI(value,rid,cid);




    });

    function evaluateformula(formula)
    { // (A1+A2) A1-10 ,A2-20

        let formularr=formula.split(" ");
        for(let i=0;i<formularr.length;i++)
        {
            let comp=formularr[i];
            if(iscompvalid(comp))
            {
                //replace logic

                let{rid,cid}=getrcidfromaddress(comp);
                let value= db[rid][cid].val;
                formula=formula.replace(comp,value);
                //console.log(formula);
            }
        }
        return eval(formula);
    }

    function deleteformula(formula,rid,cid)
    {
        let address=getaddressfromridcid(rid,cid);
        let formularr=formula.split(" ");
        //get yourself removed from your parent array
        for(let i=0;i<formularr.length;i++)
        {
            let comp=formularr[i];
            if(iscompvalid(comp))
            {
                 let pob=getrcidfromaddress(comp);
                 let pchildrenarray= db[pob.rid][pob.cid].children;
                 let filteredpchildarray=pchildrenarray.filter(test);
                 function test(elem)
                 {
                    return elem!==address;
                 }

                 db[pob.rid][pob.cid].children=filteredpchildarray;
            }
        }
      



    }

    function  getaddressfromridcid(rid,cid){
        let col=String.fromCharCode(Number(cid)+65);
        let row=Number(rid)+1;
        let address=col+row;
        return address;
    }

    function iscompvalid(comp)
    {
        let ascii=comp.charCodeAt(0);
        return (ascii>=65 && ascii<=90);
    }
    
    function updateUI(value,rid,cid)
    {
        // set evaluated answer of the formula
        $(`.cell[rid=${rid}][cid=${cid}]`).text(value);
        // update in db also
        db[rid][cid].val=value;
        db[rid][cid].isEmpty=false;
        // loop on dependencies
        let childrens=db[rid][cid].children;
        for(let i=0;i<childrens.length;i++)
        {
            let childadd=childrens[i];
            let childRC=getrcidfromaddress(childadd);
            let child=db[childRC.rid][childRC.cid];
            let nval=evaluateformula(child.formula);
            updateUI(nval,childRC.rid,childRC.cid);
        }



    }

    function getrcidfromaddress(address)
    {   
        // B2 > 1,2
        let cid = Number(address.charCodeAt(0))-65;
        let rid = Number(address=address.slice(1))-1;
        return {rid,cid};       
    }

    function setformula(rid,cid,formula,address)
    {
        db[rid][cid].formula=formula;
        //dependency-add/update > gotoparent and then add yourself to their children array(dependencies)
        
        let formularr=formula.split(" ");
        for(let i=0;i<formularr.length;i++)
        {
            let comp=formularr[i];
            if(iscompvalid(comp))
            {
                // get yourself added
                let pob=getrcidfromaddress(comp);
                db[pob.rid][pob.cid].children.push(address);
                db[rid][cid].parent.push(comp);

            }
        }
        



    }

    // new, open ,save *************************************

    // new file
    $("#new").on("click",init);

    //save file
    $("#save").on("click",function(){
        //dialog box-open up and save
        let sfilepath=dialog.showSaveDialogSync();
        let data=JSON.stringify(db);
        fs.writeFileSync(sfilepath,data);

    });

    //open file
    $("#open").on("click",function(){
    // file data read and update the UI
      let filearr=dialog.showOpenDialogSync();
      let binaryc=fs.readFileSync(filearr[0]);
      db=JSON.parse(binaryc);
      //console.log(db);
        init();
        setUI(db);
    });

    //setUI
    function setUI(db)
    {
        let allrows= $(".grid .row");
        for(let i=0;i<allrows.length;i++){
            let cols=$(allrows[i]).find(".cell");
            for(let j=0;j<cols.length;j++){
                let val=db[i][j].val;
                let isEmpty=db[i][j].isEmpty;
                $(`.cell[rid=${i}][cid=${j}]`).text(isEmpty ? "" : val);
            }
        }
    }        
    


    //initially
    function init(){
       let allrows= $(".grid .row");
        for(let i=0;i<allrows.length;i++){
            let cols=$(allrows[i]).find(".cell");
            let colsarr=[];
            for(let j=0;j<cols.length;j++){
                let cellObject={
                    val:0,
                    formula: "",
                    isEmpty:true,
                    children: [],
                    parent:[],
                    fontFamily: 'Arial',
                    fontSize: 12,
                    bold: false,
                    underline: false,
                    italic: false,
                    bgColor: '#FFFFFF',
                    textColor: '#000000',
                    halign: 'left'
                }
                let cell=$(`.cell[rid=${i}][cid=${j}]`);
                cell.text("");           
                cell.css('font-family', cellObject.fontFamily);
                cell.css("font-size", cellObject.fontSize + 'px');
                cell.css("font-weight", cellObject.bold ? "bolder" : "normal");
                cell.css("text-decoration", cellObject.underline ? "underline" : "none");
                cell.css("font-style", cellObject.italic ? "italic" : "normal");
                cell.css("background-color", cellObject.bgColor);
                cell.css("color", cellObject.textColor);
                cell.css("text-align", cellObject.halign);

                colsarr.push(cellObject);
            }
             db.push(colsarr);
        }
    }
    













})

