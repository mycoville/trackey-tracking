/// This script is for the functionalities of the combat tracker app.///
/* Current features include:
- Adding characters by giving them a name, an initiative score and a maximum HP
- Functions to change the initiative (errors etc), damage and heal the character, adjust its current round, manually set its status, and delete the character
- Changing a character's HP automatically changes its status if it fall within a certain criteria
- Saving the visible data to the browser's memory is JSON-type format
- Loading the data from the browser's memory
- Saving the visbile data to a JSON file
- Loading the JSON data for a JSON file
- Changing misc character data
- Dynamic changing for initiative, name, AC
*/
/// ---------------------------------------- ///

/// MISC INITIAL - START ///

window.onbeforeunload = function()
{
  return true;
};

var actorList = [];

var selectedIndex = 0;

var toOpenIndex = 0;

document.querySelector('.dynamic-forms').style.display = "none";
document.querySelector('#btn_download').style.display = "none";
document.querySelector('#btn_openall').style.display = "none";
document.querySelector('#btn_closeall').style.display = "none";
document.querySelector('#btn_addround').style.display = "none";


/// MISC INITIAL - END ///
/// ---------------------------------------- ///
/// CLASS - START ///

class Actor
{

  constructor(name, initiative, status, rounds, maxHP, ac)
  {
    this.name = name;
    this.init = initiative;
    this.status = status;
    this.rounds = rounds;
    this.currentHP = maxHP;
    this.maxHP = maxHP;
    this.armorclass = ac;
    this.open = false; // For hiding/showing edit buttons
    this.text = "";
    this.dssuccesses = 0;
    this.dsfails = 0;
  }
}

/// CLASS - END ///
/// ---------------------------------------- ///
/// ADDING, UPDATING - START ///

function createActor()
{
  var cName = null; // Creation name
  var cInit = -999; // Creation initiative
  var cHP = 0;
  var cAC = 0;

  cName = prompt("Please enter the name", "");
  if (cName != null && cName != "")
  {
    do {
      // Prompt initiative
      var pInit = prompt("Enter the initiative", "");
      if (pInit != "" && pInit != null && !isNaN(pInit))
      {
        cInit = parseInt(pInit);
      }
      else
      {
        cInit = null;
      }
    }
    while (cInit == null)

    do {
      var pHP = prompt("Max HP", "");
      if (pHP != "" && pHP != null && !isNaN(pHP))
      {
        cHP = parseInt(pHP);
      }
      else
      {
        cHP = 0;
      }
    }
    while (cHP == 0)

    do {
      var pAC = prompt("AC", "");
      if (pAC != "" && pAC != null && !isNaN(pAC))
      {
        cAC = parseInt(pAC);
      }
      else
      {
        cAC = 0;
      }
    }
    while (cAC == 0)

    cName = xssCleaning(cName);
    var tempActor = new Actor(cName, cInit, "alive", 0, cHP, cAC);

    actorList.push(tempActor);
    sortList();
    updateList();
    document.getElementById("btn_add").focus();
  }

}

function sortList()
{
  actorList.sort(compareValues('init', 'desc'));
}

function updateList()
{

  var listParent = document.getElementById("list");

  listParent.innerHTML = "";

  if (actorList.length != 0)
  {

    // Fixing old format JSON files by checking if the first actor has no death saves
    if(typeof actorList[0].dssuccesses === 'undefined')
    {
      for(var i = 0; i < actorList.length; i++)
      {
        actorList[i].dssuccesses = 0;
        actorList[i].dsfails = 0;
      }
    }

    for (var i = 0; i < actorList.length; i++)
    {
      var appendContent =
        "<div class='actor'>" +
        "<div class='actor-init' onclick='changeInit(" + i + ")'>" +
        actorList[i].init +
        "</div>" +
        "<div class='actor-name' onclick='changeName(" + i + ")'>" +
        actorList[i].name +
        "&nbsp;</div>" +
        "<div class='actor-hp' onclick='changeMaxHP(" + i + ")'>HP: " +
        actorList[i].currentHP + "/" + actorList[i].maxHP +
        "</div>" +
        "<div class='actor-ac' onclick='changeAC(" + i + ")'>AC: " +
        (actorList[i].armorclass != null ? actorList[i].armorclass : "0") +
        "</div>" +
        "<div class='actor-status " + actorList[i].status + "'>" +
        actorList[i].status.toUpperCase() +
        "</div>" +
        "<div class='actor-rounds'>RNDS: " +
        actorList[i].rounds + 
        "</div>" +
        "<div class='actor-toggler "+actorList[i].open+"' onclick='toggleEditButtons(" + i + ")'>&nbsp;</div>" +
        "<br>" +
        "<div id='btns_for_" + i + "' class='buttons_toggleable'>" +
        "<button class='btn_dmg' onclick='removeHP(" + i + ")'>DMG</button>" +
        "<button class='btn_heal' onclick='addHP(" + i + ")'>HEAL</button>" +
        "<button class='btn_state' onclick='toggleState(" + i + ")'>STATE</button>" +
        "<button class='btn_text' onclick='openTextChanger(" + i + ")'>TEXT</button>" +
        "<br>" +
        "<div class='deathsaves'>" +
        "<p>DEATH SAVES: </p>" + 
        "<div class='successes' onclick='changeDeathSuccess(" + i + ")'>" +
        "<div class='dssuccess "+(actorList[i].dssuccesses >= 1 ? "filled" : "")+"'>&nbsp;</div>" +
        "<div class='dssuccess "+(actorList[i].dssuccesses >= 2 ? "filled" : "")+"'>&nbsp;</div>" + 
        "<div class='dssuccess "+(actorList[i].dssuccesses >= 3 ? "filled" : "")+"'>&nbsp;</div></div>" + "<p>|</p>" +
        "<div class='failures' onclick='changeDeathFail(" + i + ")'>" +
        "<div class='dsfail "+(actorList[i].dsfails >= 1 ? "filled" : "")+"'>&nbsp;</div>" + 
        "<div class='dsfail "+(actorList[i].dsfails >= 2 ? "filled" : "")+"'>&nbsp;</div>" + 
        "<div class='dsfail "+(actorList[i].dsfails >= 3 ? "filled" : "")+"'>&nbsp;</div></div>" +
        "<div class='btn_deathreset' onclick='resetDeathSaves(" + i + ")'>RESET</div>" +
        "</div>" +
        "<button onclick='addRounds(" + i + ")'>&#8896; RND</button>" +
        "<button onclick='removeRounds(" + i + ")'>&#8897; RND</button>" +
        "<button onclick='addInit(" + i + ")'>&#8896; INIT</button>" +
        "<button onclick='removeInit(" + i + ")'>&#8897; INIT</button>" +
        "<button class='btn_remove' onclick='removeActor(" + i + ")'>&nbsp;</button><br>" +
        (actorList[i].text != null && actorList[i].text != "" ? "<div class='character_info'>" + actorList[i].text.replace(/\n/g, "<br>") + "</div>" : "") +
        "</div>" +
        "</div>";

      listParent.innerHTML = listParent.innerHTML + appendContent;

      if (!actorList[i].open)
      {
        var selector = '#btns_for_' + i;
        document.querySelector(selector).style.display = "none";
      }

    }

    document.querySelector('#btn_download').style.display = "inline-block";
    document.querySelector('#btn_openall').style.display = "inline-block";
    document.querySelector('#btn_closeall').style.display = "inline-block";
    document.querySelector('#btn_addround').style.display = "inline-block";
  }
  else
  {
    // No actors, no need to show links/buttons that do nothing
    document.querySelector('#btn_download').style.display = "none";
    document.querySelector('#btn_openall').style.display = "none";
    document.querySelector('#btn_closeall').style.display = "none";
    document.querySelector('#btn_addround').style.display = "none";
  }

  rebuildDownload();
}

/// ADDING, UPDATING - END ///
/// ---------------------------------------- ///
/// SORTING - START ///

function compareValues(key, order = 'asc')
{
  return function innerSort(a, b)
  {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key))
    {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB)
    {
      comparison = 1;
    }
    else if (varA < varB)
    {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

/// SORTING - END ///
/// ---------------------------------------- ///
/// EDITING CHARACTERS - START ///

function toggleState(index)
{

  switch (actorList[index].status)
  {
    case "alive":
      actorList[index].status = "zzz";
      break;
    case "zzz":
      actorList[index].status = "dead";
      break;
    case "dead":
      actorList[index].status = "alive";
      break;
    default:
      actorList[index].status = "alive";
      break;
  }
  updateList();
}

function addRounds(index)
{
  actorList[index].rounds++;
  updateList();
}

function removeRounds(index)
{
  actorList[index].rounds--;
  if (actorList[index].rounds < 0)
  {
    actorList[index].rounds = 0;
  }
  updateList();
}

function addInit(index)
{
  actorList[index].init++;
  sortList();
  updateList();
}

function removeInit(index)
{
  actorList[index].init--;
  sortList();
  updateList();
}

function removeHP(index)
{
  var dmgAmount = 0;
  var promptAmount = prompt("Damage amount:", "");
  if (promptAmount != "" && promptAmount != null && !isNaN(promptAmount))
  {
    dmgAmount = parseInt(promptAmount);
  }
  actorList[index].currentHP -= dmgAmount;

  if (actorList[index].currentHP > actorList[index].maxHP)
  {
    actorList[index].currentHP = actorList[index].maxHP;
  }

  updateList();
}

function addHP(index)
{
  var healAmount = 0;
  var promptAmount = prompt("Heal amount:", "");
  if (promptAmount != "" && promptAmount != null && !isNaN(promptAmount))
  {
    healAmount = parseInt(promptAmount);
  }
  actorList[index].currentHP += healAmount;
  if (actorList[index].currentHP > actorList[index].maxHP)
  {
    actorList[index].currentHP = actorList[index].maxHP;
  }

  updateList();
}

function removeActor(index)
{

  var r = confirm("Are you sure?");
  if (r == true)
  {
    actorList.splice(index, 1);
    sortList();
    updateList();
  }

}

function openTextChanger(index)
{
  selectedIndex = index;
  if (actorList[selectedIndex].text != null)
  {
    document.getElementById('textarea-character').value = actorList[selectedIndex].text;
  }
  else
  {
    document.getElementById('textarea-character').value = ""
  }
  document.querySelector('.dynamic-forms').style.display = "block";
  document.getElementById('textarea-character').focus();
}

function changeActorText()
{
  actorList[selectedIndex].text = document.getElementById('textarea-character').value;
  document.querySelector('.dynamic-forms').style.display = "none";
  updateList();
}

function changeAC(index)
{
  var newAC = 0;
  var aborted = false;
  do 
  {
    var pAC = prompt("Set AC: " + actorList[index].name, "" + actorList[index].armorclass);
    if (pAC != "" && pAC != null && !isNaN(pAC))
    {
      newAC = parseInt(pAC);
    }
    else if(pAC == null)
    {
      aborted = true;
    }
    else
    {
      newAC = 0;
    }
  }
  while (newAC == 0 && !aborted)

  if(!aborted)
  {
    actorList[index].armorclass = newAC;
    updateList();
  }
}

function changeInit(index)
{
  var newInit = 0;
  var aborted = false;
  do 
  {
    var pInit = prompt("Set INITIATIVE: " +  actorList[index].name, "" + actorList[index].init);
    if (pInit != "" && pInit != null && !isNaN(pInit))
    {
      newInit = parseInt(pInit);
    }
    else if(pInit == null)
    {
      aborted = true;
    }
    else
    {
      newInit = 0;
    }
  }
  while (newInit == 0 && !aborted)

  if(!aborted)
  {
    actorList[index].init = newInit;
    sortList();
    updateList();
  }
}

function changeMaxHP(index)
{
  var newMaxHP = 0;
  var aborted = false;
  do 
  {
    var pHP = prompt("Set MAX HP: " +  actorList[index].name + "\n\n(Resets current HP)", "" + actorList[index].maxHP);
    if (pHP != "" && pHP != null && !isNaN(pHP))
    {
      newMaxHP = parseInt(pHP);
    }
    else if(pHP == null)
    {
      aborted = true;
    }
    else
    {
      newMaxHP = 0;
    }
  }
  while (newMaxHP == 0 && !aborted)

  if(!aborted)
  {
    actorList[index].maxHP = newMaxHP;
    actorList[index].currentHP = newMaxHP;
    updateList();
  }
}

function changeName(index)
{
  var newName = "";
  var aborted = false;
  do
  {
    var pName = prompt("Set NAME: " + actorList[index].name, "" + actorList[index].name);
    if(pName != null)
    {
      pName = xssCleaning(pName);
      if(pName != "")
      {
        newName = pName;
      } 
    }
    else
    {
      aborted = true;
    }
  }
  while(newName == "" && !aborted)

  if(!aborted)
  {
    actorList[index].name = newName;
    updateList();
  }
}

function addRound2All()
{
  for (let i = 0; i < actorList.length; i++)
  {
    actorList[i].rounds++;
  }
  updateList();
  showAlert("ADDED ROUND TO ALL");
}

function changeDeathSuccess(index)
{
  var newSuccess = -1;
  var aborted = false;
  do 
  {
    var pSuccess = prompt("Death save successes: " +  actorList[index].name + "\n\n(Number between 0-3)", "" + actorList[index].dssuccesses);
    if (pSuccess != "" && pSuccess != null && !isNaN(pSuccess))
    {
      newSuccess = parseInt(pSuccess);
      if(newSuccess < 0)
      {
        newSuccess = 0;
      }
      else if(newSuccess > 3)
      {
        newSuccess = 3;
      }
    }
    else if(pSuccess == null)
    {
      aborted = true;
    }
    else
    {
      newSuccess = -1;
    }
  }
  while (newSuccess == -1 && !aborted)

  if(!aborted)
  {
    actorList[index].dssuccesses = newSuccess;
    updateList();
  }
}
function changeDeathFail(index)
{
  var newFails = -1;
  var aborted = false;
  do 
  {
    var pFail = prompt("Death save fails: " +  actorList[index].name + "\n\n(Number between 0-3)", "" + actorList[index].dsfails);
    if (pFail != "" && pFail != null && !isNaN(pFail))
    {
      newFails = parseInt(pFail);
      if(newFails < 0)
      {
        newFails = 0;
      }
      else if(newFails > 3)
      {
        newFails = 3;
      }
    }
    else if(pFail == null)
    {
      aborted = true;
    }
    else
    {
      newFails = -1;
    }
  }
  while (newFails == -1 && !aborted)

  if(!aborted)
  {
    actorList[index].dsfails = newFails;
    updateList();
  }
}
function resetDeathSaves(index)
{
  actorList[index].dssuccesses = 0;
  actorList[index].dsfails = 0;
  updateList();
}



/// EDITING CHARACTERS - END ///
/// ---------------------------------------- ///
/// EDIT VISIBILITY - START ///

function toggleEditButtons(index)
{
  actorList[index].open = !actorList[index].open;
  updateList();
}

function openAll()
{
  for (var i = 0; i < actorList.length; i++)
  {
    actorList[i].open = true;
  }
  updateList();
}

function closeAll()
{
  for (var i = 0; i < actorList.length; i++)
  {
    actorList[i].open = false;
  }
  updateList();
}

function switchToFirst()
{
  toOpenIndex = 0;
  switchOpened();
}
function switchToNext()
{
  toOpenIndex++;
  if(toOpenIndex >= actorList.length)
  {
    toOpenIndex = actorList.length-1;
  }
  switchOpened();
}
function switchToPrevious()
{
  toOpenIndex--;
  if(toOpenIndex < 0)
  {
    toOpenIndex = 0;
  }
  switchOpened();
}
function switchOpened()
{
  for (var i = 0; i < actorList.length; i++)
  {
    actorList[i].open = false;
  }
  actorList[toOpenIndex].open = true;
  updateList();
}

/// EDIT VISIBILITY - END ///
/// ---------------------------------------- ///
/// SAVING: BROWSER CACHE - START ///

function getLocal()
{
  if (localStorage.getItem('actors') != null)
  {
    actorList = JSON.parse(localStorage.getItem('actors') || "[]");
    //console.log("LOADED LIST WITH " + actorList.length + " OBJECTS");
    updateList();
    showAlert("LOADED LIST FROM CACHE");
  }
  else
  {
    showAlert("LOAD ERROR: NO LIST IN CACHE");
  }
}

function setLocal()
{
  if (actorList.length != 0)
  {
    localStorage.setItem('actors', JSON.stringify(actorList));
    //console.log("SAVED");
    showAlert("SAVED TO CACHE");
  }
  else
  {
    //console.log("SAVE ERROR: EMPTY LIST");
    showAlert("SAVE ERROR: EMPTY LIST");
  }
}

function removeLocal()
{
  localStorage.removeItem('actors');
  //console.log("REMOVED SAVE");
  showAlert("REMOVED LIST FROM CACHE");
}

/// SAVING: BROWSER CACHE - END ///
/// ---------------------------------------- ///
/// SAVING: LONG TERM - START ///

function rebuildDownload()
{
  var fileName = 'trackey_data.json';
  var textContent = JSON.stringify(actorList);
  var downloadLink = document.getElementById('btn_download');
  downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent));
  downloadLink.setAttribute('download', fileName);
}

// file upload import
const fieldImport = document.querySelector('#import-field');
fieldImport.addEventListener('change', function(e)
{
  //console.log(fieldImport.files);
  const reader = new FileReader();
  reader.onload = function()
  {
    //console.log(reader.result);
    var tempActorList = JSON.parse(reader.result);
    // Checking whether JSON seems to be in correct format
    if(typeof tempActorList[0].init === 'undefined')
    {
      showAlert("FILE IN WRONG FORMAT");
    }
    else
    {
      actorList = tempActorList;
      updateList();
    }
  };
  reader.readAsText(fieldImport.files[0]);
});

/// SAVING: LONG TERM - END ///
/// ---------------------------------------- ///
/// KEY INPUT - START  ///

var listeningForCommand = false;
var keysEnabled = true;
document.addEventListener('keydown', checkForKey);

function checkForKey(e)
{
  var pressedKey = e.key;
  //console.log(pressedKey);
  if(e.key == "§" && keysEnabled)
  {
    listeningForCommand = !listeningForCommand;
    //console.log("Listening for command: " + listeningForCommand);
  }
  else if(listeningForCommand && keysEnabled)
  {
    switch(pressedKey)
    {
      case "s":
        setLocal();
        listeningForCommand = false;
      break;
      case "l":
        getLocal();
        listeningForCommand = false;
      break;
      case "a":
        createActor();
        listeningForCommand = false;
      break;
      case "c":
        closeAll();
        listeningForCommand = false;
      break;
      case "o":
        openAll();
        listeningForCommand = false;
      break;
      case "f":
        switchToFirst();
        listeningForCommand = false;
      break;
      case "n":
        switchToNext();
        listeningForCommand = false;
      break;
      case "p":
        switchToPrevious();
        listeningForCommand = false;
      break;
      case "q":
        keysEnabled = false;
      break;
      default:
        listeningForCommand = false;
      break;
    }
  }

  toggleKeyInputVisual();
}

function toggleKeyInputVisual()
{
  if(listeningForCommand && keysEnabled)
  {
    document.getElementById("panel-inputinfo").style.display = "none";
    document.getElementById("panel-keyinput").style.display = "block";
  }
  else if(keysEnabled)
  {
    document.getElementById("panel-keyinput").style.display = "none";
    document.getElementById("panel-inputinfo").style.display = "block";
  }
  else
  {
    document.getElementById("panel-keyinput").style.display = "none";
    document.getElementById("panel-inputinfo").style.display = "none";
  }
}

async function showAlert(messageString)
{
  var alertPanel = document.getElementById("panel-alerts");
  alertPanel.classList.remove("disappear");
  setTimeout(function()
  {
    alertPanel.classList.add("disappear");
  }, 50);
  alertPanel.innerHTML = "" + messageString; 
  
}

/// KEY INPUT - END  ///

/// MISC - START ///
function xssCleaning(stringToClean)
{
  return stringToClean.replace(/\&/g, '&amp;')
  .replace(/\</g, '&lt;')
  .replace(/\>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/\'/g, '&#x27')
  .replace(/\//g, '&#x2F')
  .replace(/\;/g, '')
  .replace(/\(/g, '')
  .replace(/\)/g, '');
}

/// MISC - END ///