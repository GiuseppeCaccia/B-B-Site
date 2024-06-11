function verificaDisponibilità(ospiti, tipologia, numeroCasaVacanza, numSingole, numDoppie, numTriple, numQuadruple){
  console.log("Checking sulla struttura");
  if(tipologia == "B&B"){
    let num_ospiti_max = numSingole + 2 * numDoppie + 3 * numTriple + 4 * numQuadruple;
    let disposizione = [0,0,0,0];
    let j;
    if(num_ospiti_max < ospiti){
      return undefined;
    }
    else{
      for (j = ospiti; j<=num_ospiti_max ; j -=4){
        if(j == 0 || ospiti <= 0 ||numQuadruple ==0 || j-4<0){
          break;
        }
        numQuadruple-=1;
        ospiti-=4;
        disposizione[0] +=1;
      }
      console.log(numQuadruple);
      console.log(ospiti);
      console.log(disposizione);
      for (j = ospiti; j<=num_ospiti_max ; j -=3){
        if(j == 0 || ospiti <= 0 ||numTriple ==0 || j-3<0){
          break;
        }
        numTriple-=1;
        ospiti-=3;
        disposizione[1] +=1;
      }
      console.log(numTriple);
      console.log(ospiti);
      console.log(disposizione);
      for (j = ospiti; j<=num_ospiti_max ; j -=2){
        if(j == 0 || ospiti <= 0 ||numDoppie ==0 || j-2<0){
          break;
        }
        numDoppie-=1;
        ospiti-=2;
        disposizione[2] +=1;
      }
      console.log(numDoppie);
      console.log(ospiti);
      console.log(disposizione);
      for (j = ospiti; j<=num_ospiti_max ; j -=1){
        if(j == 0 || ospiti <= 0 ||numSingole ==0){
          break;
        }
        numSingole-=1;
        ospiti-=1;
        disposizione[3] +=1;
      }
      console.log(numSingole);
      console.log(ospiti);
      console.log(disposizione);
      if (ospiti !=0){
        return undefined;
      }
      else{
        return disposizione;
      }
    }
  }
  else{
    if(numeroCasaVacanza >= ospiti){
      disposizione = [ospiti];
      return disposizione;
    }
    else{
      return undefined;
    }
  }
}

exports.verificaDisponibilità = verificaDisponibilità;
