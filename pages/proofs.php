
    <p>
        'Proofs' have special meaning in mathematics. We can spot patterns in data and then create formula to model them and predict new data but in order to trust that formula, we need to be able to prove whether or not it's true.
        Fortunately, we have a number of tools at our disposal to do just that:
    </p>
    <h2> Proof by Exhaustion </h2>
    <p>
        Proof by Exhaustion is concerned with proving if a statement holds true across a specified range of values.  This sort of proof is useful if the 'domain' or range of the formula is known or if the domain can be split in to a series of sub domains which can then be tested individually using whatever method is appropdiate. We can exhaustively search through the domain 
        to see if our formula holds true for all possible values. You can easily automate this process using software. This is also known as the 'brute force' method.
    </p>

    <h2> Proof by induction </h2>
    <p>
        Proof by induction is all about proving if a statement holds true across an infinite range of values.  This is a harder proposition than exhaustive testing, which isn't applicable to an infinite range.
    </p>
    
    <p>
        Take a look at the following formula and statement:            

        \[0 + 1 + 2 + ... + n = {n(n+1)\over 2}\]

        We're stating here that adding numbers together until we reach the number n is the same as the formula to the right. Plugging some values in will demonstrate that it seems to work for any numbers we try but how can we <i>prove</i> this?

        Fortunately, this example is amenable to induction!

    </p>
    <p>
        The first stage on this process is to establish the <i>base case</i> which we're going to say is when \(n = 1\)

        \[0 + 1 = {1(1+1)\over 2} = 1 \]        

        We can see that in this case, our original statement that our formula equals this sequence holds true. Let's try a slightly more complex example where \(n = 5\)

        \[0 + 1 + 2 + 3 + 4 + 5 = {5(5+1)\over 2} = 15 \]
        

        This also holds true but it's quite some way off an arbitrarily large value for \(n\)
        </p>
        <p>
        However if 
        \[0 + 1 + 2 + ... + n = {n(n+1)\over 2}\]
        is true <i>by our original assumption</i>, then if we substitute our right side \(n\) with \(n+1\). That bit is important - we solve this by assuming our initial assumption is correct, using it in a forumla as if it where and checking to see if the results make sense - 
        that's the core of this method.
        \[(0 + 1 + 2 + ... + n) + (n + 1) = {(n + 1)((n + 1)+1)\over 2} \] 
        is also true as both sides of the equation are balanced. Next, remember that our \(0 + 1 + 2 + ... + n = {n(n+1)\over 2}\), meaning we can substitute the left side of the equation for our original formula with that extra \(n+1\) tacked on the end:

        \[{n(n+1)\over 2} + (n + 1) = {(n + 1)((n + 1)+1)\over 2} \] 
        </p>
        <p>
        Now that we have both sides in this form, it's time to use mathematical intuition and the algebraic tools at our disposal to rearrange and simplify the right hand side of this equation in order to prove that the original statement is true by proving that
        both sides of this equation are equal to each other. First, let's simplify all of this a little by collecting terms and making normalising our denominators:

        \[{n(n+1)\over 2} + {2(n + 1)\over 2} = {(n + 1)(n + 2)\over 2} \] 

        With everything having the \(\over 2 \) denominator, we can essentially ignore that and work with just the numerators.

        \[n(n+1) + 2(n + 1) = (n + 1)(n + 2) \] 

        Expanding our terms we're left with:

        \[n^2 + 1n  + 2n + 2 = n^2 + 1n + 2n + 2\] 

        And both sides are exactly the same, thus proving our original statement by induction and without having to run through our formula for eternity, which is a good thing for us.
        </p>
    </p>

    </p>
