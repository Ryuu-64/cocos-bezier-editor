import Vec2 = cc.Vec2;

export class Bezier {
    /**
     * https://en.wikipedia.org/wiki/B%C3%A9zier_curve
     * @param t [0, 1]
     * @param p 4 control points
     */
    static cubicBezierCurve(t: number, p: Vec2[]): Vec2 {
        const number1 = Math.pow((1 - t), 3);
        const vec1 = p[0].multiply(new Vec2(number1, number1));

        const number2 = 3 * Math.pow(1 - t, 2) * t;
        const vec2 = p[1].multiply(new Vec2(number2, number2));

        const number3 = 3 * (1 - t) * Math.pow(t, 2);
        const vec3 = p[2].multiply(new Vec2(number3, number3));

        const number4 = Math.pow(t, 3);
        const vec4 = p[3].multiply(new Vec2(number4, number4));

        return vec1.add(vec2).add(vec3).add(vec4);
    }
}