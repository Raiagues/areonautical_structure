# -*- coding: utf-8 -*-
"""
Created on Fri Jun  2 13:26:52 2023

@author: Emilly Raiane
"""
import PARAMETROS
import RESULTADOS


def pos_arb():
  t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H

  z0_1 = h+t1/2
  y0_1 = c/2+t2/2
  z0_2 = t1/2
  y0_2 = c/2+t2/2
  z0_3 = h/2+t1/2
  y0_3 = t2/2
  z0_4 = h/2+t1/2
  y0_4 = t2/2+c 
  z0_5 = h/2+t1/2
  y0_5 = t2/2+c/3
  z0_6 = h/2+t1/2
  y0_6 = t2/2+2*c/3

  z0 = [z0_1, z0_2, z0_3, z0_4, z0_5, z0_6]
  y0 = [y0_1, y0_2, y0_3, y0_4, y0_5, y0_6]

  RESULTADOS.Z0, RESULTADOS.Y0 = z0, y0

  return z0, y0


def A_nao_pond():
  t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H
  
  area = [t1*c, t1*c, h*t2, h*t2, h*t3, h*t3]
  
  RESULTADOS.A = area

  return area


def A_pond():
  A = A_nao_pond()
  E1, E2 = PARAMETROS.MODULO_ELASTICIDADE_1, PARAMETROS.MODULO_ELASTICIDADE_2
  E0 = E1
  E = [E1, E1, E2, E2, E2, E2]
  area_ponderada = 0

  for i in range(6):
    area_ponderada += E[i]*A[i]/E0

  RESULTADOS.A_POND = area_ponderada

  return area_ponderada
 

def centroide_pond():
  z0, y0 = pos_arb()
  A = A_nao_pond()
  area_ponderada = A_pond()
  E1, E2 = PARAMETROS.MODULO_ELASTICIDADE_1, PARAMETROS.MODULO_ELASTICIDADE_2
  E0 = E1
  E = [E1, E1, E2, E2, E2, E2]

  som_y = 0
  som_z = 0

  for i in range(6):
    som_y += (E[i]/E0)*y0[i]*A[i]
    som_z += (E[i]/E0)*z0[i]*A[i]

  y0_pond = som_y/area_ponderada
  z0_pond = som_z/area_ponderada

  RESULTADOS.Y0_POND, RESULTADOS.Z0_POND = y0_pond, z0_pond

  return y0_pond, z0_pond


def I_arb():
  t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H

  Iyy_1 = ((c+t2)*t1**3)/12
  Izz_1 = (t1*(c+t2)**3)/12

  Iyy_2 = Iyy_1
  Izz_2 = Izz_1

  Iyy_3 = (t2*(h-t1)**3)/12
  Izz_3 = ((h-t1)*t2**3)/12
  
  Iyy_4 = Iyy_3
  Izz_4 = Izz_3
  
  Iyy_5 = (t3*(h-t1)**3)/12
  Izz_5 = ((h-t1)*t2**3)/12
  
  Iyy_6 = Iyy_5
  Izz_6 = Izz_5

  Iyy = [Iyy_1, Iyy_2, Iyy_3, Iyy_4, Iyy_5, Iyy_6]
  Izz = [Izz_1, Izz_2, Izz_3, Izz_4, Izz_5, Izz_6]
  Iyz = [0, 0, 0, 0, 0, 0]

  RESULTADOS.IYY, RESULTADOS.IZZ, RESULTADOS.IYZ = Iyy, Izz, Iyz

  return Iyy, Izz, Iyz


def I0_pond():
  z0, y0 = pos_arb()
  A = A_nao_pond()
  E1, E2 = PARAMETROS.MODULO_ELASTICIDADE_1, PARAMETROS.MODULO_ELASTICIDADE_2
  E0 = E1
  E = [E1, E1, E2, E2, E2, E2]
  Iyy, Izz, Iyz = I_arb()

  Iy0y0_pond = 0
  Iz0z0_pond = 0
  Iy0z0_pond = 0

  for i in range(6):
    Iy0y0_pond += (E[i]/E0)*(Iyy[i]+((z0[i])**2)*A[i])
    Iz0z0_pond += (E[i]/E0)*(Izz[i]+((y0[i])**2)*A[i])
    #Iy0z0_pond += (E[i]/E0)*(Iyz[i]+(y0[i])*(z0[i])*A[i])
    Iy0z0_pond = 0
    
  RESULTADOS.IY0Y0_POND, RESULTADOS.IZ0Z0_POND, RESULTADOS.IY0Z0_POND = Iy0y0_pond, Iz0z0_pond, Iy0z0_pond

  return Iy0y0_pond, Iz0z0_pond, Iy0z0_pond


def I_pond():
  y0_pond, z0_pond = centroide_pond()
  Iyy, Izz, Iyz = I_arb()
  Iy0y0_pond, Iz0z0_pond, Iy0z0_pond = I0_pond()
  area_ponderada = A_pond()

  Iyy_pond = Iy0y0_pond-(z0_pond**2)*area_ponderada
  Izz_pond = Iz0z0_pond-(y0_pond**2)*area_ponderada
  Iyz_pond = 0
  
  RESULTADOS.IYY_POND, RESULTADOS.IZZ_POND, RESULTADOS.IYZ_POND = Iyy_pond, Izz_pond, Izz_pond
  
  return Iyy_pond, Izz_pond, Iyz_pond

