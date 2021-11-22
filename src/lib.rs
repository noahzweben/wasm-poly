use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn say(s: &str) -> String {
  println!("The Rust function say() received {}", s);
  let r = String::from("hello ");
  return r + s;
}

#[wasm_bindgen]
pub fn generate_larger_prime(n: i32) -> i32 {
  let mut n = n;
  loop {
      n += 1;
      if is_prime(n) {
          return n;
      }
  }
} 

fn is_prime(n: i32) -> bool {
  if n <= 1 {
      return false;
  }
  let sqrt_n = (n as f64).sqrt() as i32;
  for i in 2..=sqrt_n {
      if n % i == 0 {
          return false;
      }
  }
  true
}
