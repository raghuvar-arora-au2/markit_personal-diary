var int = 0

function getHTML(text){       
        $.ajax({    
            url: 'notes/text-to-html',
            type: 'POST',
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({content: text}),
            success: function(result){  
                $('#markdown').html(result)
            }
        })
    }


$('#pad').on('input', function(){
    text = $(this).val()
    getHTML(text) 
})


changeBackgroundColor = function(){ 
    $(this).css("background-color" , "#D4ECF4") 

    if($(this).find('div').text()=='\u25BE'){$(this).find('div').text('\u25B8')}
    else{$(this).find('div').text('\u25BE')} 

    $('li').not(this).css("background-color" , "transparent")

    // $(this).filter(function(){
    //     return $(this).hasClass('folder') 
    // }).next().toggleClass('d-none')    
    
}


$('.create--note').on('click', function(){
    var value = "untitled_" + int
    int++
    var newli = '<li class="ml-3 note"><div class="mx-3 d-inline-block">&#x25b8;</div><label>&#128441;</label><input value=' + value + ' type="text" readonly></li>' 
    $('.notes').append(newli) 
    var note = value 
    // var folder = ul.prev().find('input').val()
    createOrReadNote(note)
})

$(document).on('click', '.note', changeBackgroundColor) 
    
$(document).on('click', '.note', function(){  
        var filename = $(this).find('input').val() 
        // var foldername = $(this).parent() 
        // .prev().find('input').val()

        createOrReadNote(filename)       
        $('.edit--note').removeClass('d-none') 
})

function createOrReadNote(note){
    $.ajax({
        url:'notes/read',
        type:'GET',      
        dataType:'text',       
        data: {note:note},        
        success:function(result){            
            $('textarea').attr('readonly', 'readonly').css('background-color', '#F1F1F1').val(result)           
            getHTML(result)
        }
    })
}


// $(document).on('click', '.folder', changeBackgroundColor)

        
// $(document).on('click', '.folder',function(){
//         $('.save--note').addClass('d-none')
//         $('.edit--note').addClass('d-none')     
//         $('textarea').attr('readyonly', 'readonly').css('background-color', '#F1F1F1').val("")     
//         $('#markdown').text("")
//     })


$('.delete').on('click', function(){
    var element = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]')
 
    // if(element.hasClass('folder')){element.next().remove()}
    element.remove() 

    var note = element.find('input').val()
    
    $.ajax({
        url:'notes/delete-a-note',
        type:'POST',
        dataType:'json',
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify({note:note}),
        success:function(){
            console.log("inside success of /delete-a-note")
        }

    })

})


$('.edit--name').on('click', function(){
    var element = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]').find('input')
    
    element.select()
    element.attr('readonly', false)
    element.css('background-color', 'white')
    element.attr('oldValue',element.val());
})


$(document).on('keypress', 'input', function(e){
    if(e.which==13){
        $(this).attr('readonly', 'true')
        $(this).css('background-color', 'transparent')
        
        old_name = $(this).attr('oldValue')
        new_name = $(this).val() 
        
        if($(this).parent().hasClass('folder') && $(this).parent().next().children().length>0){
            url='notes/edit-folder-name'
            editName(url, old_name, new_name)
        }
        else if($(this).parent().hasClass('note')){
            url='notes/edit-note-name'
            editName(url, old_name, new_name)
        }
        else{}
        
        $(this).attr('oldValue',$(this).val());  
    }
})


function editName(url, old_name, new_name){
    $.ajax({
        url:url,
        type:'POST',
        dataType:'json',
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify({new_name:new_name, old_name:old_name}),
        success:function(){}
    })
}


$('.save--note').on('click', function(){
    
    console.log("inside save--note")
    var ele = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]')
    
    var note = ele.find('input').val()
    // var folder = ele.parent().prev().find('input').val()
 
    text=$(this).parent().find('textarea').val()

    $.ajax({
        url:'notes/upsert',
        type:'POST',
        dataType:'json',
        contentType:"application/json; charset=utf-8",
        // data: JSON.stringify({note:note, folder:folder, old_folder: folder, old_note: note, content: text}),
        data: JSON.stringify({note:note, old_note: note, content: text}),
        success:function(){
            $(document).find('textarea').attr('readonly', 'readonly').css('background-color', '#F1F1F1')
            $(document).find('.edit--note').removeClass('d-none') 
            $(document).find('.save--note').addClass('d-none') 
        }

    })
})


$('.edit--note').on('click', function(){ 
    $(this).parent().find('textarea').attr('readonly', false).css('background-color', 'white')  
    $(this).parent().find('.save--note').removeClass('d-none')   
    $(this).parent().find('.edit--note').addClass('d-none')
})


