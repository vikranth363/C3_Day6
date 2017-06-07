/*
 * Copyright 2009-2017 C3, Inc. dba C3 IoT (www.c3iot.com). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 IoT and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 IoT and/or its authorized distributors.
 * This product may be covered by one or more U.S. patents or pending patent applications.
 */

function deg2rad(deg) {
    var rad = deg * Math.PI/180;
    return rad;
}

function getDistance(departure, arrival) {
  var origin = departure;  // Airport
  var destination = arrival; // Airport

  var a1 = Airport.fetch({filter: Filter.eq("id",origin.id)});
  var a2 = Airport.fetch({filter: Filter.eq("id",destination.id)});

  var lat1  = deg2rad(a1.objs[0].location.latitude);
  var long1 = deg2rad(a1.objs[0].location.longitude);
  var lat2  = deg2rad(a2.objs[0].location.latitude);
  var long2 = deg2rad(a2.objs[0].location.longitude);

  var dLat = lat2-lat1;
  var dLong = long2-long1;

  var R = 3959; // Radius of the earth in miles
  var a = Math.pow(Math.sin(dLat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLong/2),2);
  var c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );
  var d = R * c;

  return d;
}
