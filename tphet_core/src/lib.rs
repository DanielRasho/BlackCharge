use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct Cone {
    radius: f64,
    length: f64,
    charge: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConeTrunk {
    left_radius: f64,
    right_radius: f64,
    length: f64,
    charge: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Hemisphere {
    radius: f64,
    charge: f64,
}

const EPSILON_0: f64 = 8.854187817e-12;

/// Calculates the field value at `x`.
/// `x` is assumed to be on the axis of symmetry of the cone.
pub fn cone_field_on(cone: Cone, d: f64) -> f64 {
    let Cone {
        radius,
        length,
        charge,
    } = cone;
    let sqrt_h2_plus_r2 = (length.powi(2) + radius.powi(2)).sqrt();
    let factor = 3.0*charge / (2.0 * std::f64::consts::PI * radius.powi(2) * length * EPSILON_0);

    let integral = |x: f64| {
        let parenthesis_fraction = length / sqrt_h2_plus_r2.powi(3);
        let ln_first_term = length * sqrt_h2_plus_r2 * ((d-x).powi(2)+radius.powi(2)*x.powi(2)/length.powi(2)).sqrt();
        let ln_second_term = -d*length.powi(2)+length.powi(2)*x+radius.powi(2)*x;

        x - parenthesis_fraction*(d*radius.powi(2)*(ln_first_term + ln_second_term).ln() - ln_first_term)
    };

    factor * (integral(0.0) - integral(-length))

}

/// Calculates the field value at `x`.
/// `x` is assumed to be on the axis of symmetry of the cone.
pub fn cone_trunk_field_on(cone_trunk: ConeTrunk, x: f64, parts: i64) -> f64 {
    let ConeTrunk {
        left_radius,
        right_radius,
        length,
        charge,
    } = cone_trunk;
    let R2_2 = right_radius.powi(2);
    let R2_1 = left_radius.powi(2);
    let deltaR = left_radius - right_radius;

    let factor = 3.0 * charge
        / (2.0
            * length
            * std::f64::consts::PI
            * EPSILON_0
            * deltaR
            * (R2_2 + R2_1 + left_radius * right_radius));

    let dx = length / parts as f64;
    let sum: f64 = (1..=parts)
        .map(|i| {
            let x_i = dx * i as f64;
            let numerator = x + length - x_i;
            let denominator_right = (deltaR) / length * x_i;
            numerator / (numerator.powi(2) + denominator_right.powi(2)).sqrt()
        })
        .sum();

    factor * (length - dx * sum)
}

/// Calculates the field value at `x`.
/// `x` is assumed to be on the axis of symmetry of the hemisphere.
pub fn hemisphere_field_on(hemisphere: Hemisphere, x: f64) -> f64 {
    let Hemisphere { radius, charge } = hemisphere;
    let factor = 3.0 * charge / (4.0 * std::f64::consts::PI * radius.powi(3) * EPSILON_0);
    let sqrt = (x.powi(2) + radius.powi(2)).sqrt();
    let second_term = -2.0 * x.powi(2) + radius.powi(2);
    let third_term = (x - radius) * (-2.0 * x.powi(2) + x * radius + radius.powi(2));

    let a = (sqrt * second_term - third_term);
    println!("Inner value: {}", a);

    factor * (radius - (sqrt * second_term - third_term) / (3.0 * x.powi(2)))
}

/// Calculates the field value at `x`.
/// `x` is assumed to be on the axis of symmetry of the cone.
#[wasm_bindgen]
pub fn js_cone_field_on(figure: JsValue, x: JsValue) -> Result<JsValue, JsValue> {
    let cone = serde_wasm_bindgen::from_value(figure)?;
    let x = serde_wasm_bindgen::from_value(x)?;

    let field = cone_field_on(cone, x);
    Ok(serde_wasm_bindgen::to_value(&field)?)
}

/// Calculates the field value at `x`.
/// `x` is assumed to be on the axis of symmetry of the cone trunk.
/// `parts` Represents the quantity of terms used in the Reinman sum to approximate the field.
#[wasm_bindgen]
pub fn js_cone_trunk_field_on(
    figure: JsValue,
    x: JsValue,
    parts: JsValue,
) -> Result<JsValue, JsValue> {
    let trunk = serde_wasm_bindgen::from_value(figure)?;
    let x = serde_wasm_bindgen::from_value(x)?;
    let parts = serde_wasm_bindgen::from_value(parts)?;

    let field = cone_trunk_field_on(trunk, x, parts);
    Ok(serde_wasm_bindgen::to_value(&field)?)
}

/// Calculates the field value at `x`.
/// `x` is assumed to be on the axis of symmetry of the hemisphere.
#[wasm_bindgen]
pub fn js_hemisphere_field_on(figure: JsValue, x: JsValue) -> Result<JsValue, JsValue> {
    let hemisphere = serde_wasm_bindgen::from_value(figure)?;
    let x = serde_wasm_bindgen::from_value(x)?;

    let field = hemisphere_field_on(hemisphere, x);
    Ok(serde_wasm_bindgen::to_value(&field)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cone_field_works() {
        const CORRECT_FIELD: f64 = 466966208714.77106;
        let cone = Cone {
            radius: 0.3,
            length: 0.5,
            charge: 1.0,
        };

        let point = 2.5;

        let output = cone_field_on(cone, point);
        let difference = (output - CORRECT_FIELD).abs();
        // Has at least 5 decimal points of precision...
        println!("Output: {}", output);
        println!("Correct: {}", CORRECT_FIELD);
        println!("Difference: {}", difference);
        assert!(difference <= 1e-5);
    }

    #[test]
    fn cone_trunk_works() {
        //TODO Implement test
        const CORRECT_FIELD: f64 = 0.0;
        let cone = ConeTrunk {
            length: 0.5,
            charge: 1.0,
            left_radius: 0.5,
            right_radius: 0.3,
        };

        let point = 2.5;

        let output = cone_trunk_field_on(cone, point, 500);
        let difference = (output - CORRECT_FIELD).abs();
        // Has at least 5 decimal points of precision...
        println!("Output: {}", output);
        println!("Correct: {}", CORRECT_FIELD);
        println!("Difference: {}", difference);
        assert!(difference <= 1e-5);
    }

    #[test]
    fn hemisphere_field_works() {
        //TODO Implement test
        const CORRECT_FIELD: f64 = 0.0;
        let hemisphere = Hemisphere {
            radius: 1.0,
            charge: 6e-7,
        };

        let point = 2.5;

        let output = hemisphere_field_on(hemisphere, point);
        let difference = (output - CORRECT_FIELD).abs();
        // Has at least 5 decimal points of precision...
        println!("Output: {}", output);
        println!("Correct: {}", CORRECT_FIELD);
        println!("Difference: {}", difference);
        assert!(difference <= 1e-5);
    }
}
