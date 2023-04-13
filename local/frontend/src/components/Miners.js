import React from 'react'
import { Navbar1 } from './Navbar'

export const Miners = () => {
  return (
    <>
    <div>
        <Navbar1/>
    </div>
    <div style={{paddingTop:"50px"}} >
<div>
        <div class="row">
  <div class="col-sm-6">
    <div class="card">
      <div class="card-body">
        <h3 class="card-title" style={{color:'blue'}} >Minnig No</h3>
        <h5 class="card-text" style={{color:'green'}} >1</h5>
        
      </div>
    </div>
  </div>
  <div class="col-sm-6">
    <div class="card">
      <div class="card-body">
        <h3 class="card-title" style={{color:'blue'}} >Helmet No</h3>
        <h5 class="card-text" style={{color:'green'}} >1</h5>
        
      </div>
    </div>
  </div>
</div>
</div>


    <div style={{padding:"50px"}} >
        <div class="row">
            
        <div class="col-sm-6" >
        <div class="card text-white bg-dark mb-3"style={{width: "30rem"}} >
            <div class="card-header"><h1 style={{color:'yellow'}} >Oxygen</h1></div>
                <div class="card-body">
                    <h5 class="card-title">21 %</h5>
                    
                </div>
        </div>
        </div>

        <div class="col-sm-6" >
        <div class="card text-white bg-dark mb-3" style={{width: "30rem"}} >
            <div class="card-header"><h1 style={{color:'yellow'}} >Carbon Monoxide</h1></div>
                <div class="card-body">
                    <h5 class="card-title">130 ppm</h5>
                    
                </div>
        </div>
       
        </div>
        
        

        <div class="col-sm-6" >
        <div class="card text-white bg-dark mb-3" style={{width: "30rem"}} >
            <div class="card-header"><h1 style={{color:'yellow'}} >Hydrogen Sulfide</h1></div>
                <div class="card-body">
                    <h5 class="card-title">80 ppm</h5>
                    
                </div>
        </div>
        </div>

        <div class="col-sm-6" >
        <div class="card text-white bg-dark mb-3" style={{width: "30rem"}} >
            <div class="card-header"><h1 style={{color:'yellow'}} >Methane</h1></div>
                <div class="card-body" style={{background:""}} >
                    <h5 class="card-title">2800 ppm</h5>
                    
                </div>
        </div>
        </div>

       </div>
    </div>
    </div>
    </>
  )
}
